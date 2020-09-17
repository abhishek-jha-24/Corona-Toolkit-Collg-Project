var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	cons = require('consolidate'),
	dust = require('dustjs-helpers'),
    app = express();
const { Pool } = require('pg');
var connectionString = "postgres://postgres:Pingofdeath01@@localhost:5432/corona";
const pool = new Pool({
	connectionString: connectionString,
})


app.engine('dust', cons.dust);
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


app.get('/', function(req, res){
	
	pool.query('SELECT * FROM testresults', (err, result) => {
		console.log(err, res)
		
		if(err){
			console.log("here is error----------------------")
			console.log(err)
	
			
		}
		res.render('index', {testresults: result.rows});
	
		
	});


});
app.get('/coronapositive', function(req, res){
	
	pool.query('SELECT * FROM testresults WHERE status = $1', ["positive"], (err, result) => {
		pool.query('SELECT * FROM testresults WHERE age < $1', [30], (err, resultx) => {
			pool.query('SELECT * FROM testresults WHERE age > $1 and age < $2', [30, 50], (err, resulty) => {
				pool.query('SELECT * FROM testresults WHERE age > $1', [50], (err, resultz) => {
					if(err){
						console.log("here is error----------------------")
						console.log(err)
				
						
					}
					res.render('admit', {testresults: result.rows, young: parseInt(resultx.rows.length), mid: parseInt(resulty.rows.length), old: parseInt(resultz.rows.length)});
				});

			});
		});

		
		
	
		
	});


});

app.get('/ttt', function(req, res){
	
	pool.query('SELECT * FROM testresults WHERE age < $1', [30], (err, result) => {
		pool.query('SELECT * FROM testresults WHERE age > $1 and age < $2', [30, 50], (err, resultx) => {
			pool.query('SELECT * FROM testresults WHERE age > $1', [50], (err, resulty) => {

				if(err){
					console.log("here is error----------------------")
					console.log(err)
			
					
				}
				console.log(result.rows.length)
				console.log(resultx.rows.length)
				console.log(resulty.rows.length)

				res.render('index', {testresults: result.rows, young: parseInt(result.rows.length), mid: parseInt(resultx.rows.length), old: parseInt(resulty.rows.length)});
			});
		});
		
	});


});


app.get('/deletetrial', function(req, res){
	
	pool.query('SELECT * FROM death', (err, result) => {
		pool.query('SELECT * FROM death WHERE age < $1', [30], (err, resultx) => {
			pool.query('SELECT * FROM death WHERE age > $1 and age < $2', [30, 50], (err, resulty) => {
				pool.query('SELECT * FROM death WHERE age > $1', [50], (err, resultz) => {
					if(err){
						console.log("here is error----------------------")
						console.log(err)
				
						
					}
					res.render('admit', {testresults: result.rows, young: parseInt(resultx.rows.length), mid: parseInt(resulty.rows.length), old: parseInt(resultz.rows.length)});
				});

			});
		});
	});

		
		
	
		
});












app.delete('/delete/:patientid', function(req, res){
	pool.query("DELETE FROM testresults WHERE patientid = $1",
		[req.params.patientid]);
	res.sendStatus(200);

});

app.post('/add', function(req, res){
	pool.query("INSERT INTO testresults(name, age, gender, status) VALUES($1, $2, $3, $4)",
	[req.body.name, req.body.age, req.body.gender, req.body.status]);
	
	res.redirect('/');
});
app.post('/admitpatients', function(req, res){
	pool.query('SELECT * FROM beds WHERE bedno < $1', [10], (err, resulty) => {
		if (parseInt(resulty.rows.length) == 1) {
			pool.query("INSERT INTO admit(patientid) VALUES($1)",
			[req.body.id]);
			pool.query("UPDATE beds SET bedno = (bedno + 1)", (err, result) => {
				if (err) {
					console.log(err)
				}
				else {
					console.log("no err")
				}
				
			});
		
			res.redirect('/');

		} else {
			console.log("beds not available")
		}
		
	});	
});


app.post('/discharge', function(req, res){
	pool.query("SELECT * FROM testresults WHERE patientid = $1", [req.body.id], (err, result) => {
		if (err){
			console.log("error aagaya...........................................")
			console.log(err);
		}
		console.log("----------------------------------------------------------")
		console.log(result)
		console.log(result.rows[0].age)
		pool.query("INSERT INTO recovered(patientid, age) VALUES($1, $2)",
		[req.body.id, result.rows[0].age]);
		
	});
	

	
	pool.query("UPDATE admit SET admitstatus = $1 WHERE patientid = $2", ["discharged", req.body.id], (err, result) => {
		if (err) {
			console.log(err)
		}
		else {
			pool.query("UPDATE beds SET bedno = (bedno - 1)", (err, resultx) => {
				if (err) {
					console.log(err)
				}
				else {
					console.log("no err")
				}
				
			});

			console.log("no err")
		}
		
	});

	res.redirect('/');
	
});
app.post('/discharge-death', function(req, res){
	
	pool.query("SELECT * FROM testresults WHERE patientid = $1", [req.body.id], (err, result) => {
		if (err){
			console.log("error aagaya...........................................")
			console.log(err);
		}
		console.log("----------------------------------------------------------")
		console.log(result)
		console.log(result.rows[0].age)
		pool.query("INSERT INTO death(patientid, age) VALUES($1, $2)",
		[req.body.id, result.rows[0].age]);
		
		
	});
	
	pool.query("UPDATE admit SET admitstatus = $1 WHERE patientid = $2", ["discharged", req.body.id], (err, result) => {
		if (err) {
			console.log(err)
		}
		else {
			pool.query("UPDATE beds SET bedno = (bedno - 1)", (err, resultx) => {
				if (err) {
					console.log(err)
				}
				else {
					console.log("no err")
				}
				
			});

			console.log("no err")
		}
		
	});

	res.redirect('/');
	
});


app.post('/search', function(req, res){
	
	pool.query("SELECT * FROM testresults WHERE id = $1", [req.body.id], (err, result) => {
		if (err){
			console.log("error aagaya...........................................")
			console.log(err);
		}
		
		console.log(result.rows);
		res.render('search', {testresults: result.rows[0]});
		
	});

		



});

app.post('/search1', function(req, res){
	
	pool.query("SELECT * FROM my WHERE roll = $1", [req.body.id], (err, result) => {
		if (err){
			console.log("error aagaya...........................................")
			console.log(err);
		}
		
		console.log(result.rows);
		res.render('searchname', {my: result.rows});
		
	});
});


app.listen(3000, function(){
	console.log('server started on port 3000');
});


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

/*
<head>
	<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script type="text/javascript">
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);
      var y = {young};
      var m = {mid};
      var o = {old};


      function drawChart() {

        var data = google.visualization.arrayToDataTable([
          ['Task', 'Hours per Day'],
          ['young',     y],
          ['mid',      m],
          ['old',      o]
        ]);

        var options = {
          title: 'AGE Division of Corona+ Rate'
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }
    </script>
</head>
<div id="piechart" style="width: 900px; height: 500px;"></div>
<div id="div1">

      <div id="rock1"></div>
      <div id="rock2"></div>
      <div id="rock3"></div>
      <div id="rock4"></div>
      <div id="rock5"></div>
      <div id="rock6"></div>
      <div id="rock7"></div>
      <div id="rock8"></div>
      <div id="diva1">
        <img id="img1" src="https://image.flaticon.com/icons/png/512/78/78075.png">
        <div id="divaa1">
        	<div id="btna1">
        		<a href="/coronapositive">Link 1</a>
			    
        	</div>
        	<div id="btna2">
        		
			    <a href="iii">Link 2</a>
		
        	</div>
        	<div id="btna3">
        				   
			    <a href="#">Link 3</a>
        	</div>


          <img id="img2" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Windows_Settings_app_icon.png/768px-Windows_Settings_app_icon.png">
          <div id="divaaa1"></div>
        </div>
        <div id="divaa2">
          <img id="img3" src="https://openclipart.org/image/2400px/svg_to_png/399/molumen-phone-icon.png">
          <div id="divaaa2"></div>
          <input id="btnb1" type="button" value="Phone">
          <input id="btnb2" type="button" value="Call">
        </div>
        <div id="divaa3">
          <input id="btnc1" type="button" value="About">
          <input id="btnc2" type="button" value="Creator" href="location.href="https://codepen.io/bowties/"">
          <input id="btnc3" type="button" value="More">
          <img id="img3" src="https://image.flaticon.com/icons/svg/32/32175.svg">
          <div id="divaaa3"></div>
          <div id="divaaa4"></div>
        </div>
      </div>
    </div>
    <div class="dropdown-content">
    <a href="#">Link 1</a>
    <a href="#">Link 2</a>
    <a href="#">Link 3</a>
  </div>

  #rock1{
  position:absolute;
  left:-30px;
  top:0px;
  width:40px;
  height:40px;
  transform:rotate(45deg);
  animation:b 6s infinite;
}
#rock2{
  position:absolute;
  left:200px;
  top:-25px;
  width:40px;
  height:40px;
  transform:rotate(45deg);
  animation:a 6s infinite;
}
#rock3{
  position:absolute;
  left:585px;
  top:5px;
  width:40px;
  height:40px;
  transform:rotate(45deg);
  animation:a 6s infinite;
}
#rock4{
  position:absolute;
  left:385px;
  top:90px;
  width:40px;
  height:40px;
  transform:rotate(45deg);
  animation:b 6s infinite;
}
#rock5{
  position:absolute;
  left:60px;
  top:140px;
  width:25px;
  height:25px;
  transform:rotate(45deg);
  animation:a 6s infinite;
}
#rock6{
  position:absolute;
  left:500px;
  top:-25px;
  width:25px;
  height:25px;
  transform:rotate(45deg);
  animation:a 6s infinite;
}
#rock7{
  position:absolute;
  left:60px;
  top:-55px;
  width:25px;
  height:25px;
  transform:rotate(45deg);
  animation:b 6s infinite;
}
#rock8{
  position:absolute;
  left:530px;
  top:130px;
  width:25px;
  height:25px;
  transform:rotate(45deg);
  animation:b 6s infinite;
}
@keyframes a{
  0%{
    background:transparent;
  }
  50%{
    background:darkorange;
  }
  100%{
    background:transparent;
  }
}
@keyframes b{
  0%{
    background:darkorange;
  }
  50%{
    background:transparent;
  }
  100%{
    background:darkorange;
  }
}
#div1{
  position:absolute;
  left:calc(50% - 300px);
  top:calc(50% - 1200px);
  width:600px;
  height:100px;
  border:20px solid rgb(60, 60, 60);
  border-radius:100px;
}
#diva1{
  position:absolute;
  width:590px;
  height:90px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;

}
#img1{
  position:absolute;
  left:15px;
  top:15px;
  width:60px;
}
#img2{
  position:absolute;
  left:10px;
  top:10px;
  width:60px;
}
#img3{
  position:absolute;
  left:10px;
  top:10px;
  width:60px;
}
#divaa1{
  position:absolute;
  left:150px;
  width:80px;
  height:80px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;
  background:transparent;
}

#divaa1:hover{
  height:250px;

}
#divaa1:hover > #divaaa1{
  height:180px;
  border:5px solid orange;
}
#divaaa1{
  position:absolute;
  top:-5px;
  left:75px;
  width:40px;
  height:80px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;
}
#divaa2{
  position:absolute;
  left:300px;
  width:80px;
  height:80px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;
}
#divaa2:hover{
  height:200px;
}
#divaa2:hover > #divaaa2{
  height:230px;
}
#divaaa2{
  position:absolute;
  top:-5px;
  left:-25px;
  width:25px;
  height:80px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;
}
#divaa3{
  position:absolute;
  left:450px;
  width:80px;
  height:80px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;
}
#divaa3:hover{
  height:260px;
}
#divaa3:hover > #divaaa3{
  height:200px;
}
#divaa3:hover > #divaaa4{
  height:140px;
}
#divaaa3{
  position:absolute;
  top:-5px;
  left:-50px;
  width:40px;
  height:80px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;
}
#divaaa4{
  position:absolute;
  top:-5px;
  left:75px;
  width:25px;
  height:80px;
  border:5px solid orange;
  border-radius:100px;
  background:orange;
  transition:.6s;
}
#btna1{
  pointer-events: none;
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:none;
  transition:.6s;
}
#divaa1:hover < #btna1{
  display: none;
  top:90px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#divaa1:hover > #btna1{
  top:90px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#btna2{
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:pointer;
  transition:.6s;
}
#divaa1:hover > #btna2{
  top:140px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#btna3{
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:pointer;
  transition:.6s;
}
#divaa1:hover > #btna3{
  top:190px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#btnb1{
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:pointer;
  transition:.6s;
}
#divaa2:hover > #btnb1{
  top:90px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#btnb2{
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:pointer;
  transition:.6s;
}
#divaa2:hover > #btnb2{
  top:140px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#btnc1{
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:pointer;
  transition:.6s;
}
#divaa3:hover > #btnc1{
  top:90px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#btnc2{
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:pointer;
  transition:.6s;
}
#divaa3:hover > #btnc2{
  top:140px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}
#btnc3{
  position:absolute;
  top:0px;
  background:transparent;
  width:75px;
  color:transparent;
  padding-top:5px;
  padding-bottom:5px;
  font-family:Georgia, serif;
  font-size:15px;
  border:2.5px solid transparent;
  border-radius:100px;
  cursor:pointer;
  transition:.6s;
}
#divaa3:hover > #btnc3{
  top:190px;
  color:black;
  background:dimgrey;
  padding-bottom:5px;
}

*/
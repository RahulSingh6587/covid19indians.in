var LastUpdatedOnGlobal = moment().format('MMMM Do YYYY, h:mm:ss');

$(document).ready(function () {
	CallToAPI();
	ShowTime();
});

function ShowTime() {
	var dt = new Date();
	var vartime = dt.toLocaleTimeString('en-GB');
	$('#div_time').text("TIME: " + vartime);
	window.setTimeout("ShowTime()", 1000);
}

function CallToAPI() {
	//debugger;
	$.ajax({
		type: "GET",
		url: "https://api.covid19india.org/data.json",
		dataType: "json",
		success: function (result, status, xhr) {
			//debugger;
			var LastUpdatedOn = result.statewise[0].lastupdatedtime;
			var res = CreateWeatherJson(result);

			DynamicTable(res, LastUpdatedOn)
			//debugger;
			ty = ForGraph(result);

			PlotGraph(ty);
			//debugger;
			//ui = ConvertStringToNumberForTestedJson(result);
			ui = PlotTested(result);

			PlotTestedHighchart(ui);

		},
		error: function (xhr, status, error) {
			console.log(
				"Error: " +
				status +
				" " +
				error +
				" " +
				xhr.status +
				" " +
				xhr.statusText
			);
		}
	});
}

function ForGraph(JsonGraph) {
	//debugger;
	var newJsonGraph = "";

	for (var i = JsonGraph.cases_time_series.length - 1; i > 0; i--) {
		//if (JsonGraph.statewise[i].confirmed > 0) {
		//console.log(i);


		dailyconfirmed = JsonGraph.cases_time_series[i].dailyconfirmed;
		dailydeceased = JsonGraph.cases_time_series[i].dailydeceased;
		dailyrecovered = JsonGraph.cases_time_series[i].dailyrecovered;
		date = JsonGraph.cases_time_series[i].date;
		totalconfirmed = JsonGraph.cases_time_series[i].totalconfirmed;
		totaldeceased = JsonGraph.cases_time_series[i].totaldeceased;
		totalrecovered = JsonGraph.cases_time_series[i].totalrecovered;

		newJsonGraph = newJsonGraph + "{";
		newJsonGraph = newJsonGraph + '"date"' + ": " + '"' + date.concat('2020') + '"' + ",";
		newJsonGraph = newJsonGraph + '"dailyconfirmed"' + ": " + dailyconfirmed + ",";
		newJsonGraph = newJsonGraph + '"dailydeceased"' + ": " + dailydeceased + ",";
		newJsonGraph = newJsonGraph + '"dailyrecovered"' + ": " + dailyrecovered + ",";
		newJsonGraph = newJsonGraph + '"totalconfirmed"' + ": " + totalconfirmed + ",";
		newJsonGraph = newJsonGraph + '"totaldeceased"' + ": " + totaldeceased + ",";
		newJsonGraph = newJsonGraph + '"totalrecovered"' + ": " + totalrecovered;
		newJsonGraph = newJsonGraph + "},";
		if (i == 30) {
			break;
		}

	}
	var yuu = "[" + newJsonGraph.slice(0, newJsonGraph.length - 1) + "]";
	return yuu;
}

function CreateWeatherJson(json) {
	var newJson = "";

	for (i = 0; i < json.statewise.length; i++) {
		if (json.statewise[i].confirmed > 0) {
			State = json.statewise[i].state;
			StateCode = json.statewise[i].statecode;
			Active = json.statewise[i].active;
			Confirmed = json.statewise[i].confirmed;
			Recovered = json.statewise[i].recovered;
			Deceased = json.statewise[i].deaths;
			ConfirmedDelta = json.statewise[i].deltaconfirmed;
			RecoveredDelta = json.statewise[i].deltarecovered;
			DeceasedDelta = json.statewise[i].deltadeaths;

			newJson = newJson + "{";
			newJson = newJson + '"State"' + ": " + '"' + State + '"' + ",";
			newJson = newJson + '"StateCode"' + ": " + '"' + StateCode + '"' + ",";
			newJson = newJson + '"Active"' + ": " + Active + ",";
			newJson = newJson + '"Confirmed"' + ": " + Confirmed + ",";
			newJson = newJson + '"Recovered"' + ": " + Recovered + ",";
			newJson = newJson + '"ConfirmedDelta"' + ": " + ConfirmedDelta + ",";
			newJson = newJson + '"RecoveredDelta"' + ": " + RecoveredDelta + ",";
			newJson = newJson + '"DeceasedDelta"' + ": " + DeceasedDelta + ",";
			newJson = newJson + '"Deceased"' + ": " + Deceased;
			newJson = newJson + "},";
		}
	}
	return "[" + newJson.slice(0, newJson.length - 1) + "]";
}

function DynamicTable(res, LastUpdatedOn) {
	var data = JSON.parse(res);
	//debugger;
	PieChart(data);
	$("#HeaderDiv").append(HeaderDiv(data));
	var html = "";

	html += FirstTable(data);
	$("#weatherTable").append(html);
	LastUpdatedOnGlobal = LastUpdatedOn;
	$("#lbl2").text("LAST UPDATED : " + LastUpdatedOn);
  sessionStorage.setItem("lastupdated", LastUpdatedOn);
	$('#DynamicTable').DataTable({
		"paging": false,
		"order": [[2, "desc"]],
		"searching": false,
		"info": false,
		"columnDefs": [{
			"targets": [1, 3, 4],
			"orderable": false
		}]
	});
}

function HeaderDiv(data) {
	var html = "";
	//html += '<div class="row">';
	//html += '<div class="table-responsive col-md-12">';
	html += '<table class="table table-border table-hover">';
	html += "<thead>";
	html += "<tr>";
	html += "<th class='State header' style='color: red; text-align: center' Key='CONFIRMED'>CONFIRMED</th>";
	html += "<th class='State header' style='color: blue; text-align: center' key='ACTIVE'>ACTIVE</th>";
	html += "<th class='State header' style='color: green; text-align: center' key ='RECOVERED'>RECOVERED</th>";
	html += "<th class='State header' style='color: grey; text-align: center' key = 'DECEASED'>DECEASED</th>";
	html += "</tr>";
	html += "</thead>";
	html += "<tbody>";
	html += "<tr>";
	html += " <td class = 'colortake'>";

	if (data[0].ConfirmedDelta > 0) {
		html += " <span clas='header'  style='color: rgb(255, 7, 58);'>";
		html += " [+" + NumbersInCommaSeperated(data[0].ConfirmedDelta) + "]</span>";
	}

	html += " " + NumbersInCommaSeperated(data[0].Confirmed) + "</td>";
	html += " <td class = 'colortake1'>";
	if (data[0].ActiveDelta > 0) {
		html += " <span clas='header' style='color:#0000ff;'>";
		html +=
			" <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='19' x2='12' y2='5'></line><polyline points='5 12 12 5 19 12'></polyline></svg>";
		html += " [" + 000 + "]</span>";
	}

	html += " " + NumbersInCommaSeperated(data[0].Active) + "</td>";
	html += " <td class = 'colortake2'>";
	if (data[0].RecoveredDelta > 0) {
		html += " <span  clas='header' style='color: rgb(0,128,0);'>";
		html += " [+" + data[0].RecoveredDelta + "]</span>";
	}

	html += " " + NumbersInCommaSeperated(data[0].Recovered) + "</td>";
	html += " <td class = 'colortake3'>";

	if (data[0].DeceasedDelta > 0) {
		html += " <span clas='header' style='color: rgb(128, 128, 128);'>";
		html += " [+" + data[0].DeceasedDelta + "]</span>";
	}

	html += " " + NumbersInCommaSeperated(data[0].Deceased) + "</td>";
	html += "</tr>";
	html += " </tbody>";
	html += " </table>";
	//html += " </div>";
	//html += " </div>";
	return html;
}

function FirstTable(data) {
	var html = '';
	//html += '<div class="table-responsive col-md-6">';
	html += '<table id="DynamicTable" class="table table-striped table-light" >';
	html += "<thead>";
	html += "<tr>";
	html += '<th class="State header" id="State"style="cursor: pointer;"  key="STATE">STATE/UT</th>';
	html += '<th class="State header" id="Cnfmd" key="CONFIRMED" style="color:red">CONFIRMED</th>';
	html += '<th class="State header" id="Actv" style="cursor: pointer;color:blue"  key="ACTIVE">ACTIVE</th>';
	html += '<th class="State header" id = "Rcvrd" key="RECOVERED" style="color:green">RECOVERED</th>';
	html += '<th class="State header" id="Dcsd" key="DECEASED" style="color:grey">DECEASED</th>';
	html += "</tr>";
	html += "</thead>";
	html += "<tbody>";

	for (var i = 1; i < data.length; i++) {
		html += "<tr>";
		html += ' <td ><a class="State" key="' + data[i].State + '" target ="_blank" href="States.html?'+ data[i].StateCode +'">' + data[i].State + ' </a></td>';
		html += " <td class='data'>";

		if (data[i].ConfirmedDelta > 0) {
			html += " <span  style='color: rgb(255, 7, 58);'>";
			html +=
				" <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='19' x2='12' y2='5'></line><polyline points='5 12 12 5 19 12'></polyline></svg>";
			html += " " + NumbersInCommaSeperated(data[i].ConfirmedDelta) + "</span>";
		}

		html += " " + NumbersInCommaSeperated(data[i].Confirmed) + "</td>";
		html += " <td>" + NumbersInCommaSeperated(data[i].Active) + "</td>";
		html += " <td>";

		if (data[i].RecoveredDelta > 0) {
			html += " <span  style='color: rgb(0, 255, 0);'>";
			html +=
				" <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='19' x2='12' y2='5'></line><polyline points='5 12 12 5 19 12'></polyline></svg>";
			html += " " + NumbersInCommaSeperated(data[i].RecoveredDelta) + "</span>";
		}
		html += " " + NumbersInCommaSeperated(data[i].Recovered) + "</td>";
		html += " <td>";
		if (data[i].DeceasedDelta > 0) {
			html += " <span  style='color: rgb(128, 128, 128);'>";
			html +=
				" <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='19' x2='12' y2='5'></line><polyline points='5 12 12 5 19 12'></polyline></svg>";
			html += " " + data[i].DeceasedDelta + "</span>";
		}
		html += " " + NumbersInCommaSeperated(data[i].Deceased) + "</td>";
		html += "</tr>";
	}
	html += " </tbody>";
	html += " </table>";
	//html += " </div>";
	return html;
}

var arrLang = {
	'en': {
		'Maharashtra': 'Maharashtra',
		'Tamil Nadu': 'Tamil Nadu',
		'Delhi': 'Delhi',
		'Telangana': 'Telangana',
		'Rajasthan': 'Rajasthan',
		'Kerala': 'Kerala',
		'Uttar Pradesh': 'Uttar Pradesh',
		'Andhra Pradesh': 'Andhra Pradesh',
		'Madhya Pradesh': 'Madhya Pradesh',
		'Karnataka': 'Karnataka',
		'Gujarat': 'Gujarat',
		'Haryana': 'Haryana',
		'Jammu and Kashmir': 'Jammu and Kashmir',
		'Punjab': 'Punjab',
		'West Bengal': 'West Bengal',
		'Odisha': 'Odisha',
		'Bihar': 'Bihar',
		'Uttarakhand': 'Uttarakhand',
		'Assam': 'Assam',
		'Chandigarh': 'Chandigarh',
		'Himachal Pradesh': 'Himachal Pradesh',
		'Ladakh': 'Ladakh',
		'Andaman and Nicobar Islands': 'Andaman and Nicobar Islands',
		'Chhattisgarh': 'Chhattisgarh',
		'Goa': 'Goa',
		'Puducherry': 'Puducherry',
		'Jharkhand': 'Jharkhand',
		'Manipur': 'Manipur',
		'Mizoram': 'Mizoram',
		'Arunachal Pradesh': 'Arunachal Pradesh',
		'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli',
		'Tripura': 'Tripura',
		'Daman and Diu': 'Daman and Diu',
		'Lakshadweep': 'Lakshadweep',
		'Meghalaya': 'Meghalaya',
		'Nagaland': 'Nagaland',
		'Sikkim': 'Sikkim',

		// for table headers

		'STATE': 'STATE',
		'CONFIRMED': 'CONFIRMED',
		'ACTIVE': 'ACTIVE',
		'RECOVERED': 'RECOVERED',
		'DECEASED': 'DECEASED',

		//Headers

		'INDIA COVID-19 TRACKER': 'INDIA COVID-19 TRACKER',
		'LastUpdated': 'LAST UPDATED ' + LastUpdatedOnGlobal,
		'Time': 'TIME'

	},
	'km': {
		'Maharashtra': 'महाराष्ट्र',
		'Tamil Nadu': 'तमिलनाडु',
		'Delhi': 'दिल्ली',
		'Telangana': 'तेलंगाना',
		'Rajasthan': 'राजस्थान',
		'Kerala': 'केरल',
		'Uttar Pradesh': 'उत्तर प्रदेश',
		'Andhra Pradesh': 'आंध्र प्रदेश',
		'Madhya Pradesh': 'मध्य प्रदेश',
		'Karnataka': 'कर्नाटक',
		'Gujarat': 'गुजरात',
		'Haryana': 'हरियाणा',
		'Jammu and Kashmir': 'जम्मू और कश्मीर',
		'Punjab': 'पंजाब',
		'West Bengal': 'पश्चिम बंगाल',
		'Odisha': 'ओडिशा',
		'Bihar': 'बिहार',
		'Uttarakhand': 'उत्तराखंड',
		'Assam': 'असम',
		'Chandigarh': 'चंडीगढ़',
		'Himachal Pradesh': 'हिमाचल प्रदेश',
		'Ladakh': 'लद्दाख',
		'Andaman and Nicobar Islands': 'अंडमान व नोकोबार द्वीप समूह',
		'Chhattisgarh': 'छत्तीसगढ़',
		'Goa': 'गोवा',
		'Puducherry': 'पुडुचेरी',
		'Jharkhand': 'झारखंड',
		'Manipur': 'मणिपुर',
		'Mizoram': 'मिजोरम',
		'Arunachal Pradesh': 'अरुणाचल प्रदेश',
		'Dadra and Nagar Haveli': 'दादरा और नगर हवेली',
		'Tripura': 'त्रिपुरा',
		'Daman and Diu': 'दमन और दीव',
		'Lakshadweep': 'लक्षद्वीप',
		'Meghalaya': 'मेघालय',
		'Nagaland': 'नगालैंड',
		'Sikkim': 'सिक्किम',

		// for table header

		'STATE': 'राज्य',
		'CONFIRMED': 'पॉजिटिव',
		'ACTIVE': 'सक्रिय',
		'RECOVERED': 'डिस्चार्ज',
		'DECEASED': 'मौत',

		//Header

		'INDIA COVID-19 TRACKER': 'भारत COVID-19 ट्रेकर',
		'LastUpdated': 'आखरी अपडेट ' + LastUpdatedOnGlobal,
		'Time': 'समय'
	},
	'Punjabi': {
		'Maharashtra': 'ਮਹਾਰਾਸ਼ਟਰ',
		'Tamil Nadu': 'ਤਮਿਲ ਨਾਡੂ',
		'Delhi': 'ਦਿੱਲੀ',
		'Telangana': 'ਤੇਲੰਗਾਨਾ',
		'Rajasthan': 'ਰਾਜਸਥਾਨ',
		'Kerala': 'ਕੇਰਲਾ',
		'Uttar Pradesh': 'ਉੱਤਰ ਪ੍ਰਦੇਸ',
		'Andhra Pradesh': 'ਆਂਧਰਾ ਪ੍ਰਦੇਸ਼',
		'Madhya Pradesh': 'ਮਧਿਆ ਪ੍ਰਦੇਸ',
		'Karnataka': 'ਕਾਰਨਾਟਕ',
		'Gujarat': 'ਗੁਜਰਾਤ',
		'Haryana': 'ਹਰਿਆਣਾ',
		'Jammu and Kashmir': 'ਜੰਮੂ ਅਤੇ ਕਸ਼ਮੀਰ',
		'Punjab': 'ਪੰਜਾਬ',
		'West Bengal': 'ਪੱਛਮੀ ਬੰਗਾਲ',
		'Odisha': 'ਓਡੀਸ਼ਾ',
		'Bihar': 'ਬਿਹਾਰ',
		'Uttarakhand': 'ਉਤਰਾਖੰਡ',
		'Assam': 'ਅਸਾਮ',
		'Chandigarh': 'ਚੰਡੀਗੜ',
		'Himachal Pradesh': 'ਹਿਮਾਚਲ ਪ੍ਰਦੇਸ਼',
		'Ladakh': 'ਲੱਦਾਖ',
		'Andaman and Nicobar Islands': 'ਅੰਡੇਮਾਨ ਅਤੇ ਨਿਕੋਬਾਰ ਆਈਲੈਂਡਜ਼',
		'Chhattisgarh': 'ਛਤੀਸਗੜ',
		'Goa': 'ਜੀਓਏ',
		'Puducherry': 'ਵਿਦਿਆਕਾਰੀ',
		'Jharkhand': 'ਝਾਰਖੰਡ',
		'Manipur': 'ਮਨੀਪੁਰ',
		'Mizoram': 'ਮਿਜੋਰਮ',
		'Arunachal Pradesh': 'ਅਰਨੇਚਲ ਪ੍ਰਦੇਸ',
		'Dadra and Nagar Haveli': 'ਦਾਦਰਾ ਅਤੇ ਨਗਦ ਹਵੇਲੀ',
		'Tripura': 'ਤ੍ਰਿਪੁਰਾ',
		'Daman and Diu': 'ਦਮਨ ਅਤੇ ਦਿਉ',
		'Lakshadweep': 'ਲਕਸ਼ਦਵੀਪ',
		'Meghalaya': 'ਮੇਘਾਲਿਆ',
		'Nagaland': 'ਨਾਗਾਲੈਂਡड',
		'Sikkim': 'ਸਿੱਕਮ',

		// for table header

		'STATE': 'ਰਾਜ',
		'CONFIRMED': 'ਪੱਕਾ',
		'ACTIVE': 'ਕਿਰਿਆਸ਼ੀਲ',
		'RECOVERED': 'ਬਰਾਮਦ',
		'DECEASED': 'ਵਿਚਾਰਿਆ ਗਿਆ',

		//Header

		'INDIA COVID-19 TRACKER': 'ਭਾਰਤ COVID-19 ਟਰੈਕਰ',
		'LastUpdated': 'ਆਖਰੀ ਅਪਡੇਟ ਕੀਤਾ ' + LastUpdatedOnGlobal,
		'Time': 'ਸਮਾਂ'
	}

};

// Process translation
$(function () {
	$('.translate').click(function () {
		var lang = $(this).attr('id');

		$('.State').each(function (index, item) {
			$(this).text(arrLang[lang][$(this).attr('key')]);
		});
		return false;
	});
});

function PieChart(data) {
	//debugger;
	Highcharts.chart('TotalCasePie', {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		title: {
			text: '<b>CASES OF COVID - 19</b>'
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br>value: {point.y}'
		},
		accessibility: {
			point: {
				valueSuffix: '%'
			}
		},
		credits: {
			enabled: false
		},
		exporting: {
			enabled: false
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %<br>value: {point.y}'
				}
			}
		},
		series: [{
			name: 'Patients',
			colorByPoint: true,
			data: [{
				name: 'Active',
				color: '#0000ff',
				y: data[0].Active,
				sliced: true,
				selected: true
			}, {
				name: 'Recovered',
				color: '#008000',
				y: data[0].Recovered
			}, {
				name: 'Deceased',
				color: '#808080',
				y: data[0].Deceased
			}]
		}]
	});


}

function PlotGraph(ty) {
	//debugger;
	var data = JSON.parse(ty);
	var dailydeceased = [];
	var dailyrecovered = [];
	var dailyconfirmed = [];

	var date = [];
	var totalconfirmed = [];
	var totaldeceased = [];
	var totalrecovered = [];

	$.each(data.reverse(), function (i, val) {
		dailyconfirmed.push(val.dailyconfirmed);
		dailyrecovered.push(val.dailyrecovered);
		dailydeceased.push(val.dailydeceased);
		//date.push(moment(val.date).format("YYYY-MM-DD"));
		date.push(moment(val.date).format("MMMM Do"));
		totalconfirmed.push(val.totalconfirmed);
		totaldeceased.push(val.totaldeceased);
		totalrecovered.push(val.totalrecovered);
	});
	//debugger;

	Highcharts.chart('DailyCaseGraph', {
		chart: {
			type: 'spline'
		},
		title: {
			text: '<b>INDIA - DAILY CASES</b>'
		},
		credits: {
			enabled: false
		},
		xAxis: {
			categories: date,
			crosshair: true
		},
		yAxis: {
			min: 0,
			title: {
				text: '<b>No. of cases</b>'
			}
		},
		tooltip: {
			shared: true
		},
		exporting: {
			enabled: false
		},
		plotOptions: {
			column: {
				pointPadding: 0.2,
				borderWidth: 0
			},
			series: {
				lineWidth: 3
			}
		},
		series: [{
			name: 'Confirmed',
			data: dailyconfirmed,
			color: '#ff0000'

		}, {
			name: 'Recovered',
			data: dailyrecovered,
			color: '#008000'

		}, {
			name: 'Deceased',
			data: dailydeceased,
			color: '#808080'

		}]
	});

	Highcharts.chart('TotalCaseGraph', {
		chart: {
			type: 'spline'
		},
		title: {
			text: '<b>INDIA - TOTAL CASES</b>'
		},
		credits: {
			enabled: false
		},
		exporting: {
			enabled: false
		},
		xAxis: {
			categories: date,
			crosshair: true
		},
		//           plotOptions: {
		//               series: {
		//                   lineWidth:5
		//}
		//           },
		yAxis: {
			min: 0,
			title: {
				text: '<b>No. of cases</b>'
			}
		},
		tooltip: {
			shared: true
		},
		plotOptions: {
			column: {
				pointPadding: 0.2,
				borderWidth: 0
			},
			series: {
				lineWidth: 3
			}
		},
		series: [{
			name: 'Total Confirmed',
			data: totalconfirmed,
			color: '#ff0000'

		}, {
			name: 'Total Recovered',
			data: totalrecovered,
			color: '#008000'

		}, {
			name: 'Total Deceased',
			data: totaldeceased,
			color: '#808080'

		}]
	});

}

function PlotTested(testjson) {
	//debugger;
	//var yuu = JSON.parse(testjson.tested);
	var newJson = "";

	for (var i = 0; i < testjson.tested.length; i++) {
		if (testjson.tested[i].samplereportedtoday != "" && testjson.tested[i].positivecasesfromsamplesreported != "" && testjson.tested[i].totalindividualstested != "") {
			samplereportedtoday = testjson.tested[i].samplereportedtoday.replace(/,/g, '');
			positivecasesfromsamplesreported = testjson.tested[i].positivecasesfromsamplesreported.replace(/,/g, '');
			totalindividualstested = testjson.tested[i].totalindividualstested.replace(/,/g, '');
			totalpositivecases = testjson.tested[i].totalpositivecases.replace(/,/g, '');
			updatetimestamp = testjson.tested[i].updatetimestamp;
			source = testjson.tested[i].source;

			newJson = newJson + "{";
			newJson = newJson + '"source"' + ": " + '"' + source + '"' + ",";
			newJson = newJson + '"updatetimestamp"' + ": " + '"' + updatetimestamp + '"' + ",";
			newJson = newJson + '"samplereportedtoday"' + ": " + samplereportedtoday + ",";
			newJson = newJson + '"positivecasesfromsamplesreported"' + ": " + positivecasesfromsamplesreported + ",";
			newJson = newJson + '"totalindividualstested"' + ": " + totalindividualstested + ",";
			newJson = newJson + '"totalpositivecases"' + ": " + totalpositivecases;
			newJson = newJson + "},";

		}
	}
	return "[" + newJson.slice(0, newJson.length - 1) + "]";
}

function PlotTestedHighchart(oo) {
	//debugger;

	var data = JSON.parse(oo);

	var samplereportedtoday = [];
	var positivecasesfromsamplesreported = [];

	var updatetimestamp = [];

	$.each(data, function (i, val) {

		samplereportedtoday.push(val.samplereportedtoday);
		if (i == data.length - 1) {
			TotalPersonTested = val.totalindividualstested;
			TotalPersonPositive = val.totalpositivecases;
		}

		positivecasesfromsamplesreported.push(val.positivecasesfromsamplesreported);
		updatetimestamp.push(moment(val.updatetimestamp, 'DD/MM/YYYY').format("MMMM Do"));
	});

	Highcharts.chart('DailyTested', {
		chart: {
			type: 'column'
		},
		title: {
			text: '<b>TESTED SAMPLE - DATE WISE</b>'
		},
		xAxis: {
			categories: updatetimestamp
		},
		yAxis: {
			min: 0,
			title: {
				text: 'Samples Reported'
			}
		},
		credits: {
			enabled: false
		},
		tooltip: {
			pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
			shared: true
		},
		plotOptions: {
			column: {
				stacking: 'normal'
			}
		},
		series: [{
			name: 'Reported Sample For Testing',
			data: samplereportedtoday,
			color: 'blue'
		}, {
			name: 'Positive Cases After Testing',
			data: positivecasesfromsamplesreported,
			color: 'red'
		}]
	});

	TestedPieChart();
}

function TestedPieChart() {

	Highcharts.setOptions({
		lang: {
			thousandsSep: ','
		}
	});


	Highcharts.chart('TotalTestedPie', {
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie'
		},
		title: {
			text: '<b>TOTAL TESTED COVID - 19</b>'
		},
		tooltip: {
			pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br>value: {point.y}'
		},
		accessibility: {
			point: {
				valueSuffix: '%'
			}
		},
		credits: {
			enabled: false
		},
		exporting: {
			enabled: false
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b>: {point.percentage:.1f} %<br>value: {point.y}'
				}
			}
		},
		series: [{
			name: 'Cases',
			colorByPoint: true,
			data: [{
				name: 'Total Individual Tested',
				color: '#0000ff',
				y: TotalPersonTested,
				sliced: true,
				selected: true
			}, {
				name: 'Total Individual Positive',
				color: '#FF0000',
				y: TotalPersonPositive
			}]
		}]
	});

}

function NumbersInCommaSeperated(x) {
	//debugger;
	x = x.toString();
	var lastThree = x.substring(x.length - 3);
	var otherNumbers = x.substring(0, x.length - 3);
	if (otherNumbers != '')
		lastThree = ',' + lastThree;
	var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
	return res;
}
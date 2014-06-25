var users_hash = {};
var users = [];

$(function() {
    // create view models
    for (var i = 0; i < user_data.length; i++) {
	var user = new UserModel(user_data[i]);
	users.push(user);
	users_hash[user_data[i].id] = user;
    }
    function UserModel(data) {
	this.avatar = data.avatar;
	this.name = data.name;
	this.occupation = data.occupation;
	this.graph = [];
	this.graph_loaded = ko.observable(false);
	this.total_conversions = 0;
	this.total_impressions = 0;
	this.total_revenue = 0;
	this.graph_begin = 0;
	this.graph_end = 0;
	var self = this;
	this.formatted_total_revenue = ko.computed(function() {
	    return "$" + Math.round(self.total_revenue*100)/100;
	}, this, {deferEvaluation:true});
	this.graph_range = ko.computed(function() {
	    var begin = new Date(self.graph_begin);
	    var end = new Date(self.graph_end);
	    return 'Conversions ' + begin.getMonth() + '/' + begin.getDate() + ' - ' + end.getMonth() + '/' + end.getDate();
	}, this, {deferEvaluation:true});
    }

    ko.applyBindings(users);
});

ko.bindingHandlers.chart = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        // First get the latest data that we're bound to
        var value = valueAccessor();
        var daily_totals = {};
        value.forEach(function(item) {
	    var d = new Date(item[0]);
	    if (!daily_totals[d.getDate()])
		daily_totals[d.getDate()] = item[1];
	    else
		daily_totals[d.getDate()] += item[1];
	});
        var labels = [];
        var data = [];
        var max = 0;
        for (var prop in daily_totals) {
            labels.push(prop);
            data.push(daily_totals[prop]);
            if (max < daily_totals[prop])
                max = daily_totals[prop];
        }
        var data = {
            labels : labels,
            datasets : [{
		fillColor : "rgba(151,187,205,0.5)",
		strokeColor : "rgba(151,187,205,1)",
		pointColor : "rgba(151,187,205,1)",
		pointStrokeColor : "#fff",
		data : data
	    }]
        };
        var options = {
            //Boolean - If we want to override with a hard coded scale
            scaleOverride : false,
            //** Required if scaleOverride is true **
            //Number - The number of steps in a hard coded scale
            scaleSteps : Math.ceil(max),
            //Number - The value jump in the hard coded scale
            scaleStepWidth : 1,
            //Number - The scale starting value
            scaleStartValue : 1
        };

        //Get the context of the canvas element we want to select
        var ctx = element.getContext("2d");
        var myNewChart = new Chart(ctx).Line(data, options);
    }
};

$.getJSON("logs.json", function(data) {
    processLogs(data);
    // signal that the graphs have been loaded
    for (var i = 0; i < users.length; i++) {
	users[i].graph_loaded(true);
    }
});

function processLogs(data) {
    for (var i = 0; i < data.length; i++) {
	var user = users_hash[data[i].user_id];
	if (!user) continue;
	if (data[i].type === 'conversion') {
            user.graph.push([data[i].time, data[i].revenue]);
            user.total_revenue += data[i].revenue
            user.total_conversions++
            if (user.graph_begin === 0 || user.graph_begin > data[i].time)
		user.graph_begin = data[i].time;
            if (user.graph_end ===0 || user.graph_end < data[i].time)
		user.graph_end = data[i].time;
	} else {
            user.total_impressions++;
	}
    }
}

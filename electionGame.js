var cellList = [];
var cellViewList = [];
var totalScoreView = null;
var roundAndCountdownView = null;

var cell = function(weight) {
    this.weight = weight;
    this.red = 50;
    this.red_worker = 0;
    this.blue = 50;
    this.blue_worker = 0;
};

var worker_total = 10;

var loop_cnt = -1;

var timer = null;

var loop = function() {

    if (loop_cnt == -1) {
        ai_random("blue");
    }

    loop_cnt++;

    var countdown = 9 - (loop_cnt % 10);
    var round_num = Math.floor(loop_cnt / 10) + 1;
    var roundAndCountdownStr = "Round : " + round_num + "<br/> Countdown : " + countdown;
    if (round_num == 11) {
        end();
    } else {
        roundAndCountdownView.innerHTML = roundAndCountdownStr;
    }

    if (countdown == 0) {
        //commit point of workers <start>
        for (var i = 0; i < cellList.length; i++) {
            var c = cellList[i];

            /**
            	compare red_worker and blue_worker
            	increase Math.abs(red_worker - blue_worker) on bigger party
            **/

            var diff = Math.abs(c.red_worker - c.blue_worker);


            if (c.red_worker > c.blue_worker) {
                if ((c.red + diff) > 100) {
                    diff = 100 - c.red;
                }
                c.red += diff;
                c.blue -= diff;
            } else {
                if ((c.blue + diff) > 100) {
                    diff = 100 - c.blue;
                }
                c.blue += diff;
                c.red -= diff;
            }
        }

        //commit point of workers <end>

        //printStat();

        ai_random("blue");

        sync();
    }

};

var printStat = function() {
    var log = "stat - " + Date() + "\n";
    for (var i = 0; i < cellList.length; i++) {
        var c = cellList[i];
        log += i + "(" + c.weight + ") : " + c.red + "(" + c.red_worker + "), " + c.blue + "(" + c.blue_worker + ")\n";
    }
    console.log(log);
}

var printScore = function() {
    var red = 0;
    var blue = 0;
    for (var i = 0; i < cellList.length; i++) {
        var c = cellList[i];
        if (c.red == c.blue) {
            var tieScore = Math.floor(c.weight / 2)
            red += tieScore;
            blue += tieScore;
        } else if (c.red > c.blue) {
            red += c.weight;
        } else if (c.blue > c.red) {
            blue += c.weight;
        }
    }
    log = "<span style='color:red;'>" + red + "</span> : <span style='color:blue;'>" + blue + "</span>";

    totalScoreView.innerHTML = log;

    return log;
}

var calcScore = function() {
    var red = 0;
    var blue = 0;
    for (var i = 0; i < cellList.length; i++) {
        var c = cellList[i];
        if (c.red == c.blue) {
            var tieScore = Math.floor(c.weight / 2)
            red += tieScore;
            blue += tieScore;
        } else if (c.red > c.blue) {
            red += c.weight;
        } else if (c.blue > c.red) {
            blue += c.weight;
        }
    }
    return [red, blue];
}

var countActiveWorker = function(party) {
    var sum = 0;
    for (var i = 0; i < 51; i++) {
        if (party == "red") {
            sum += cellList[i].red_worker;
        } else {
            sum += cellList[i].blue_worker;
        }
    }
    return sum;
}

var message = function(msg) {
    document.getElementById("msg").innerHTML = msg;
}

var addWorker = function(cell_number, party, amount) {
    var c = cellList[cell_number];
    var newTotalWorkerCount = countActiveWorker(party) + amount;

    if (newTotalWorkerCount > worker_total) {
        console.log("out of range - worker")
        newTotalWorkerCount = -1;
    } else {
        if (party == "red") {
            if (c.red_worker + amount >= 0) {
                c.red_worker += amount;
            } else {
                console.log("out of range - worker")
                newTotalWorkerCount = -1;
            }
        } else {
            if (c.blue_worker + amount >= 0) {
                c.blue_worker += amount;
            } else {
                console.log("out of range - worker")
                newTotalWorkerCount = -1;
            }
        }
    }

    sync();

    return newTotalWorkerCount;
};

var cellPress = function(id) {
    this.id = id;
    this.action = function(event) {
        console.log(id);
        console.log(event);
        var cellNum = id.split('_')[1];
        if (event.shiftKey) {
            addWorker(cellNum, "red", -1);
        } else {
            addWorker(cellNum, "red", 1);
        }
    }
}

var init = function() {
    var weight_lst = [
        3, 4, 3, 4, 12,
        4, 3, 3, 10, 20,
        10, 16, 29, 11,
        4, 7, 6, 3, 3, 6,
        11, 18, 20, 14,
        7, 55, 6, 9, 5, 10,
        8, 5, 13, 10, 3,
        11, 5, 6, 6, 11,
        15, 9, 3, 7, 8,
        6, 9, 16, 4, 38,
        29
    ];

    for (var i = 0; i < 51; i++) {
        var id = "c_" + i;
        cellList[i] = new cell(weight_lst[i]);
        cellViewList[i] = document.getElementById(id);
        cellViewList[i].addEventListener('mousedown', new cellPress(id).action)
    }

    totalScoreView = document.getElementById("totalScore");

    roundAndCountdownView = document.getElementById("roundAndCountdown");

    sync();


};

var start = function() {
    var sb = document.getElementById("start");
    sb.disabled = true;
    timer = setInterval(loop, 1000);
};

var end = function() {
    clearInterval(timer);
    var score = calcScore();
    var red = score[0];
    var blue = score[1];
    if (red > blue) {
        roundAndCountdownView.innerHTML = "end<br/>red win!";
    } else {
        roundAndCountdownView.innerHTML = "end<br/>blue win!";
    }

}

var sync = function() {

    printScore();

    for (var i = 0; i < 51; i++) {
        var c = cellList[i];
        var c_v = cellViewList[i];

        if (c.red == c.blue) {
            c_v.style.backgroundColor = "lightgray";
        } else if (c.red > c.blue) {
            c_v.style.backgroundColor = "pink";
        } else if (c.red < c.blue) {
            c_v.style.backgroundColor = "skyblue";
        }

        var c_v_c = c_v.getElementsByClassName("content")[0];
        var html = "";
        html += "<span style='color:red;'>" + c.red + " </span> : <span style='color:blue'>" + c.blue + "</span><br/>";
        if (c.red_worker != 0) {
            html += "<span style='color:red;'>+" + c.red_worker + "</span> : ";
        } else {
            html += "<span style='color:gray;'>" + "--" + "</span> : ";
        }
        if (c.blue_worker != 0) {
            html += "<span style='color:blue'>+" + c.blue_worker + "</span>";
        } else {
            html += "<span style='color:gray'>" + "--" + "</span>";
        }


        c_v_c.innerHTML = html;
    }
}



var ai_random = function(party) {
    //reset all party worker
    for (var i = 0; i < 51; i++) {
        if (party == "red") {
            cellList[i].red_worker = 0;
        } else {
            cellList[i].blue_worker = 0;
        }
    }

    var remainWorker = worker_total;

    //add random worker
    while (remainWorker > 0) {
        var cellNum = (Math.floor(Math.random() * 100000) % 51);
        addWorker(cellNum, party, 1);
        remainWorker--;
    }

}
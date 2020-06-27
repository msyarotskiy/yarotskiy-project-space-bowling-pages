'use strict';

const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
const stringName = 'YAROTSKIY_BOWLING_RECORDS';
const uiTableScores = $('#tableScores');

restoreInfo();

function restoreInfo() {
    $.ajax(
        {
            url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
            data: {f: 'READ', n: stringName},
            success: readReady, error: errorHandler
        }
    );
}

function readReady(callresult) {
    if (callresult.error != undefined)
        console.log(callresult.error);
    else if (callresult.result != "") {
        let result = JSON.parse(callresult.result);
        createRecordTable(uiTableScores, result);
    }
}

function compareScore(a, b) {
    return a.record - b.record;
}

function createRecordTable(uiTableScores, data) {
    let pageHTML = '';
    data.sort(compareScore);
    pageHTML += `<table border=1><thead>High scores</thead><tbody>`;
    pageHTML += `<td>№</td><td>Name</td><td>Score</td>`;
    for (let i = 0; i < data.length; i++) {
        if (i > 9) {
            break;
        }
        pageHTML += '<tr>';
        pageHTML += `<td>${i + 1}</td><td>${data[i].name}</td><td>${data[i].record}</td>`;
        pageHTML += '</tr>';
    }
    pageHTML += '</tbody></table>';
    uiTableScores.html(pageHTML);
}

function errorHandler(jqXHR, statusStr, errorStr) {
    alert(statusStr + ' ' + errorStr);
}
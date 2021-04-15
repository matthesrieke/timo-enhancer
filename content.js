var schedules = [];
var sessionCookie = '';

//find all the image in answer feed,thumbnail and ad feeds and add blurclasses
var enhanceCellStyles = function () {
    $('.x-grid-td.timecell').find('div').removeClass('withborder').addClass('withborder');
}

//find all the image in answer feed,thumbnail and ad feeds and remove blurclasses
var removeEnhanceCellStyles = function () {
    $('.x-grid-td.timecell').find('div').removeClass('withborder')
}

var addEnhanceAdjustments = function () {
    $('<style> .withborder {border-style: dashed; border-width: 1px; border-color: #DDD}</style>').appendTo('head');
    enhanceCellStyles();
    schedules.push(setInterval(function () { enhanceCellStyles() }, 1000));
}

var removeEnhanceAdjustments = function () {
    removeEnhanceCellStyles();
    schedules.forEach(function (i) { clearInterval(i) });
}

var addExportButton = function () {

}


//message listener for background
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command === 'timo_enhanceUi_changed') {
        if (request.timo_enhanceUi) {
            addEnhanceAdjustments();
        } else {
            removeEnhanceAdjustments();
        }
    } else if (request.command === 'timo_cookie') {
        sessionCookie = request.cookie.value
        console.log('session cookie: ', sessionCookie);
    }

    sendResponse({ result: 'success' });
});

//on init perform based on chrome storage value
window.onload = function () {
    chrome.storage.sync.get('timo_enhanceUi', function (data) {
        if (data.timo_enhanceUi) {
            addEnhanceAdjustments();
        } else {
            removeEnhanceAdjustments();
        }
    });

    if (window.location.toString().indexOf('timo24.de')) {
        $(window).on('hashchange', function (e) {
            if (window.location.hash.indexOf('auswertung_projektauswertung.jsp') > 0) {
                addExportButton();
                
                $("iframe").each(function() {
                    var from, to;

                    $(this).contents().find('form[name="auswertung"] input').each(function(index){  
                        var input = $(this);
                        var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;

                        if (input.attr('name') === 'fromDate') {
                            from = new Date(input.val().replace(pattern,'$3-$2-$1'));
                        }
                        else if (input.attr('name') === 'toDate') {
                            to = new Date(input.val().replace(pattern,'$3-$2-$1'));
                        }
                        
                    });
                    
                    if (from && to) {
                        window.prompt('Copy and open:', `https://testbed.dev.52north.org/timo-evaluation/alleProjekteMonat?JSESSIONID=${sessionCookie}&start=${from.toISOString().split('T')[0]}&end=${to.toISOString().split('T')[0]}`)
                    }
                    
                });
            }
        });

    }
}


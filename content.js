/**
 * Trigger change events for hidden inputs
 */
 MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

 var trackChange = function(element) {
   var observer = new MutationObserver(function(mutations, observer) {
     if(mutations[0].attributeName == "value") {
         $(element).trigger("change");
     }
   });
   observer.observe(element, {
     attributes: true
   });
 }
/**
 * end: Trigger change events for hidden inputs
 */

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


var addExportButton = function (theIframe, cookie, from, to, projectId) {
    var targetUrl = `https://testbed.dev.52north.org/timo-evaluation/alleProjekteMonat?JSESSIONID=${cookie}&start=${from.toISOString().split('T')[0]}&end=${to.toISOString().split('T')[0]}&projectId=${projectId}`
    theIframe.contents().find('input[name="Button3_enhancer"]').remove();
    theIframe.contents().find('input[type="button"]').each(function (index) {
        var theButton = $(this);
        if (theButton.attr('value') === 'Anwenden') {
            var openTarget = `window.open('${targetUrl}', '_blank');`;
            $(`<input type="button" name="Button3_enhancer" class="button enhancer-button" style="width : 445px; background-color: red; margin-left: 1em" value="Auswertung: Monat/Projekt/MA" onclick="${openTarget}">`).insertAfter(theButton);
        }
    });
}

var evaluateFormValues = function(theForm, theIframe) {
    var from, to, projectId;
    theForm.find('input').each(function (index) {
        var input = $(this);
        var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;

        if (input.attr('name') === 'fromDate') {
            from = new Date(input.val().replace(pattern, '$3-$2-$1'));
        }
        else if (input.attr('name') === 'toDate') {
            to = new Date(input.val().replace(pattern, '$3-$2-$1'));
        }

        projectId = -1;
    });

    if (from && to) {
        console.log('Adding export button');
        addExportButton(theIframe, sessionCookie, from, to, projectId);
    } else {
        console.log('From/To not found. Not adding export button');
    }
}

var injectButton = function() {
    setTimeout(function () {
        $("iframe").each(function () {
            var theIframe = $(this);
            var theForm = theIframe.contents().find('form[name="auswertung"]');
            theIframe.contents().find('form[name="auswertung"] input[type="hidden"]').each(function() {
                trackChange( $(this)[0] );
            });
            theIframe.contents().find('form[name="auswertung"] input[type="hidden"]').change(function() {
                evaluateFormValues(theForm, theIframe);
            });
            evaluateFormValues(theForm, theIframe);
        });
    }, 2500);
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
        // listen to changes
        $(window).on('hashchange', function (e) {
            if (window.location.hash.indexOf('auswertung_projektauswertung.jsp') > 0) {
                injectButton();
            }
        });

        // check now
        if (window.location.hash.indexOf('auswertung_projektauswertung.jsp') > 0) {
            injectButton();
        }
    }
}


// var jsdom = require("jsdom");
// $ = require('jquery')(new jsdom.JSDOM().window);
require('popper.js');
const $ = require('jquery');
require('bootstrap');
$(function(){
    var inputs = $('.input');
    var paras = $('.description-flex-container').find('p');
    inputs.click(function(){
        var t = $(this),
            ind = t.index(),
            matchedPara = paras.eq(ind);

        t.add(matchedPara).addClass('active');
        inputs.not(t).add(paras.not(matchedPara)).removeClass('active');
    });
});
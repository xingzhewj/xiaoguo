var silder = (function($){
  var box = $("#js_focus");
  var boxWidth = box.width()+8;
  var boxIn = $("#js_focus_in");
  var itemCount = boxIn.find('div').length;
  var intervalTime = 2000;
  var index = 0;
  var autoMoveTimer = 0;
  var canAutoMove = true;
  var beginX = 0;
  var moveDistance = 200;
  var itemControl = $("#focus_control_list_id");

  function init(){
    autoMove();
    initEvent();
  }

  function moveNext(){
    if(index == (itemCount-1)){
      boxIn.removeClass('anim');
      addTranform("0px");
      index = 0;
    }
    setTimeout(function(){
      boxIn.addClass('anim');
      index++;
      addTranform("-"+(index * boxWidth) + "px");
      $("#scrnLi_"+(index%4)).addClass('current');
      $("#scrnLi_"+(index%4)).siblings().removeClass('current');
    },100);
  }

  function addTranform(value){
    var pres = ["-webkit-","-ms-","-moz-","-0-",""];
    for (var i = 0; i < pres.length; i++) {
      boxIn.css(pres[i]+"transform","translateX("+value+")");
    };
  }

  function autoMove(){
    clearInterval(autoMoveTimer);
    autoMoveTimer = setInterval(moveNext,intervalTime);
  }

  function stopMove(){
    clearInterval(autoMoveTimer);
  }

  function initEvent(){
    boxIn.on("touchstart",function(ev){
      beginX = ev.touches[0].pageX;
      canAutoMove = false;
      stopMove();
      if(index == (itemCount-1)){
        boxIn.removeClass('anim');
        addTranform("0px");
        index = 0;
      }
    });
    boxIn.on("touchmove",function(ev){
      var posX = 0;
      if(index == 0 && (ev.touches[0].pageX - beginX) > 0){
        canAutoMove = false;
        stopMove();
        if(index == 0){
          boxIn.removeClass('anim');
          addTranform("-"+(itemCount*1032)+"px");
          index = itemCount - 1;
        }
      }
      posX = ev.touches[0].pageX - beginX - (index * boxWidth);
      addTranform((posX+"px"));
    });
    boxIn.on("touchend",function(ev){
      boxIn.addClass('anim');
      var _pageX = ev.changedTouches[0].pageX - beginX;
      if(Math.abs(_pageX) > moveDistance){
        if(_pageX > 0){
          addTranform("-"+((index-1)*boxWidth) + "px");
          index--;
        }else{
          addTranform("-"+((index+1)*boxWidth) + "px");
          index++;
        }
      }else{
        addTranform("-"+(index*boxWidth) + "px");
      }
      $("#scrnLi_"+(index%4)).addClass('current');
      $("#scrnLi_"+(index%4)).siblings().removeClass('current');
      autoMove();
    });
    /*****************控制事件***********************/
    itemControl.find('li').bind("click",function(ev){
      stopMove();
      index = parseInt($(this).attr("id").match(/\d/g).join(''));
      addTranform("-"+(index*boxWidth)+"px");
      $(this).addClass('current');
      $(this).siblings().removeClass('current');
    });

    $(".btn_next").bind('click', function(event) {
      moveNext();
    });
     $(".btn_prev").bind('click', function(event) {
      if(index == 0){
        index = itemCount -1;
      }
      index = index -2;
      moveNext();
    });
  }

  return{
    init:init,
    stopmove:stopMove
  }
})((Zepto || jQuery));
/**
 * author bihind
 */
(function(win, doc, $){
    
    this.Slide = Slide;

    function Slide(options) {
        this.buffer = [];//缓存区
        this.container = $("#" + options.container);//容器          
        this.viewContainer = $('#' + options.viewContainer);//可视容器  
        this.controlNext = options.controlNext; 
        this.controlPrev = options.controlPrev;
        this.controlList = options.controlList;
        this.itemCount = focusData.length;//轮播个数
        this.width = options.width || win.innerWidth || doc.documentElement.clientWidth || doc.body.clientWidth;//兼容各种内核浏览器宽高
        this.height = options.height || win.innerHeight || doc.documentElement.clientHeight || doc.body.clientHeight;
        this.loop = options.loop || false;//default
        this.index = 0;
        this.direction = options.direction || "left";
        this.interval = options.interval || 3000;
        this.timeId;

        this.init();
        this.siblingDoms = this.container.find(options.childrenDom);        
        this.bindDOM();
        this.autoMove();
    };

    //初始化,拼装数据
    Slide.prototype.init = function() {
        var list = [];
        for (var i = 0; i < focusData.length; i++) {
            var item = focusData[i];
            list.push(this.assemUnit(item));
        };
        this.container.css('width', this.width * this.itemCount + 'px');
        this.container.html(list.join(' '));
        this.viewContainer.append(this.assemConUint(focusData));
        this.viewContainer.css({"width": this.width + 'px', "height": this.height + 'px'});
    };

    //拼装数据元
    Slide.prototype.assemUnit = function(item) {
        return '<div><a href="' + item.link + '" target="_self"><img style="width:' + this.width + 'px;height:' + this.height + 'px" src="' + item.img + '" /></a></div>';
    };

    //拼装缩略图和控制数据元
    Slide.prototype.assemConUint = function(data){
        var _conHtml = '<div class="focus_control" id="scrnTab"><div id="scrnBtnL"><a href="javascript:;" hidefocus="true" title="上一个" class="btn_prev" style="height:55px;">上一个</a></div><div class="focus_control_list" id="focus_control_list_id"><ul>';
        for (var i = 0; i < data.length; i++) {
            _conHtml += '<li class="current" data-key="'+ i +'"><a href="javascript:void(0);" onclick="return false;" target="video"><img src="'+data[i].img+'" alt="对越作战争议战法：步兵自缚坦克前被当活靶打" title="对越作战争议战法：步兵自缚坦克前被当活靶打"><span class="shadow"></span></a></li>';
        };
        _conHtml += '</ul></div><div id="scrnBtnR"><a href="javascript:;" hidefocus="true" title="下一个" class="btn_next" style="height:55px;">下一个</a></div>';
        return _conHtml;
    }

    // 绑定DOM事件
    Slide.prototype.bindDOM = function() {
        var self = this;
        
        // 接触
        var startHandler = function(event) {
            event.preventDefault();
            if(typeof self.timeId == 'number'){
                clearTimeout(self.timeId);
            }
            self.startTime = +new Date();
            self.startX = typeof event.touches == 'undefined' ? 0 : event.touches[0].pageX;    
            // self.startX = event.touches[0].pageX;
            // console.dir(self.startX);
            self.offsetX = 0;
            self.cache(self.index);
            self.move();
            self.clear();
        }

        // 移动
        var moveHandler = function(event) {
            event.preventDefault();
            self.offsetX = typeof event.touches == 'undefined' ? 0 : event.touches[0].pageX - self.startX;
            self.cache(self.index);
            self.move(self.offsetX);
            self.clear();
        }

        // 结束
        var endHandler = function(event) {
            event.preventDefault();                 
            self.autoMove();
            self.endTime = +new Date();
            var boundary = self.width / 4;//临界值
            
            // 长时间触碰,按位移算
            if(self.endTime - self.startTime > 300){
                if(self.offsetX > boundary){
                    // 向右滑动
                    self.moveIndex('-1')
                }else if(self.offsetX < -boundary){
                    // 向左滑动
                    self.moveIndex('+1');
                }else{
                    // 本页
                    self.moveIndex('0');
                }
            }else{
                // 短时间触碰,快速移动
                if(self.offsetX > 50){
                    self.moveIndex('-1');
                }else if(self.offsetX < -50){
                    self.moveIndex('+1');
                }else{
                    self.moveIndex('0');
                }
            }
    
        }

        //上一个
        var clickNext = function(event){
            self.moveIndex('+1');
        }

        //下一个
        var clickPrev = function(event){
            self.moveIndex('-1');
        }

        //缩略图选择
        var clickCurrent = function(event){
            var _index = parseInt($(this).attr("data-key"));
            self.moveIndex(_index);
        }

        // 事件注册
        this.container.on('touchstart', startHandler);
        this.container.on('touchmove', moveHandler);
        this.container.on('touchend', endHandler);

        $("#"+ this.controlPrev).on('click',clickPrev);
        $("#"+ this.controlNext).on('click',clickNext);
        $("#" + this.controlList + " ul li").on("click",clickCurrent);
    };

    // 移动函数
    Slide.prototype.moveIndex = function(num) {
        var num = parseInt(num);
        var idx = this.index;//初始的index值
        // 设置动画
        this.cache(idx);    
        this.move(-num * this.width, 0.2);
        this.clear();       
        // 记录改变后的index值
        idx = idx + num;    
        this.index = this.recalculate(idx); 
    };

    // 动画函数  duration单位为s
    Slide.prototype.animate = function(item, value, duration) {
        var duration = typeof duration == 'undefined' ? 0 : duration;
        var prefixs = ['-moz-', '-webkit-', '-ms-', '-o-', ''];
        $.each(prefixs, function(index) {
            $(item).css(this + 'transform', 'translate3d(' + value +'px, 0, 0)');
            $(item).css(this + 'transition', this + 'transform ' + duration + 's linear');
        });
    };  

    // 重计算索引值  
    Slide.prototype.recalculate = function(num) {
        if(num > this.itemCount - 1){
            num = 0;
        }else if(num < 0){
            num = this.itemCount - 1;
        }   
        return num; 
    };
     
    // 增加缓存区数据  
    Slide.prototype.cache = function(idx) {
        var preIdx = this.recalculate(idx - 1);
        var sufIdx = this.recalculate(idx + 1);
        this.buffer.push({"dom": this.siblingDoms[preIdx], "num": preIdx});
        this.buffer.push({"dom": this.siblingDoms[idx], "num": idx});
        this.buffer.push({"dom": this.siblingDoms[sufIdx], "num": sufIdx});
    };

    // 删除缓存区数据  
    Slide.prototype.clear = function() {
        this.buffer = [];
    };

    // 移动
    Slide.prototype.move = function(value, time) {
        var offsetX = typeof value == 'undefined' ? 0 : value;
        var duration = typeof time == 'undefined' ? 0 : time;
        this.animate(this.buffer[0]['dom'], -(this.buffer[0]['num']/1 + 1 ) * this.width + offsetX, duration);  
        this.animate(this.buffer[1]['dom'], -(this.buffer[1]['num']/1) * this.width + offsetX, duration);
        this.animate(this.buffer[2]['dom'], -(this.buffer[2]['num']/1 - 1 ) * this.width + offsetX, duration);      
    };

    // 自动切换
    Slide.prototype.autoMove = function() {
        var self = this;
        var fn = function() {
            var idx = self.direction == "left" ? '+1' : '-1';
            self.container.trigger('touchstart');
            setTimeout(function(){
                self.moveIndex(idx);
                self.autoMove();
            }, 0.002);
        }
        self.timeId = setTimeout(fn, self.interval);    
    };

})(window, document, Zepto);
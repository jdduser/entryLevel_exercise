window.onload=function(){
        	var picwidth=1006;
			var picnum=3;
			var timer;
		
			var prev=document.getElementById("prev");
			var next=document.getElementById("next");
			var list=document.getElementsByClassName("list");
			var buttons=document.getElementsByClassName("button")[0].getElementsByTagName("span");
			var content=document.getElementsByClassName("content");
			var index=1;

			function showbutton(t){
				for(var i=0;i<buttons.length;i++){
					if(buttons[i].className=="on"){
						buttons[i].className="";
						break;
					}
				}
				buttons[t-1].className="on";
			}
			/*控制向左向右滑动*/
			function animate(offset){
				var newleft=parseInt(list[0].style.left) + offset ;
				var time=300;
				var interval=10;
				var speed=offset/(time/interval);  //每次位移量

				function go(){
					if((speed<0 && parseInt(list[0].style.left)>newleft)||(speed>0 && parseInt(list[0].style.left)<newleft)){
						list[0].style.left=parseInt(list[0].style.left)+speed+'px';
						setTimeout(go,interval);
					}else{
						list[0].style.left=newleft+ 'px';
			        	if(newleft>-picwidth){
			        		list[0].style.left=-picwidth*picnum+ 'px';
			        	}
			        	if(newleft<-picwidth*picnum){
			        		list[0].style.left=-picwidth+ 'px';
			        	}
					}
				}
				go();
	        }
			next.onclick=function(){
				if (index == 3) {
                    index = 1;
                }
                else {
                    index += 1;
                }
				animate(-picwidth);
				showbutton(index);
			};
			prev.onclick=function(){
				 if (index == 1) {
                    index = 3;
                }
                else {
                    index -= 1;
                }
				animate(picwidth);
				showbutton(index);
			};

			for(var i=0;i<buttons.length;i++){
				buttons[i].onclick=function(num){
					return function(){
						animate(-(num-index+1)*picwidth);
						//list[0].style.left=-(num+1)*1006+ 'px';
						index=num+1;
						showbutton(num+1);
					};
				}(i);
			}

			function play(){
				timer=setInterval(function(){
					next.onclick();
				},1000);
			}
			function stop(){
				clearInterval(timer);
			}
			content[0].onmouseout=play;
			content[0].onmouseover=stop;
			play();
		};
		
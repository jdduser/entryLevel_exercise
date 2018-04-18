function $(s){
    return document.querySelectorAll(s);
}

var lis = $("#list li");

for (var i=0;i<lis.length;i++){
	lis[i].onclick = function(){
        for (var j=0;j<lis.length;j++){
        	lis[j].className="";
        }
        this.className="selected";
        if(bs){
        	bs[bs.stop?"stop":"noteoff"]();
        }
        load("/media/"+this.title);
	};
}

var xhr = new XMLHttpRequest();
var ac =new (AudioContext||webkitAudioContext)();    //这种的可以这样写
var gn =  ac[ac.createGain?"createGain":"createGainNode"]();  
//(ac.createGain||ac.createGainNode)()这样写不行ac.creatrGain()||ac.createGainNode() 这样写也是不行的
gn.connect(ac.destination);
var analyser = ac.createAnalyser();
var size=256;
analyser.fftsize=512;
analyser.connect(gn);

var bs=null;

var count=0;

var box=$("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

var Dots =[];

function random(m,n){
	return Math.round(Math.random()*(n-m)+m);
}
function getDots(){
	Dots = [];
	for(var i =0;i< size;i++){
		var x= random(0,width);
		var y =random(0,height);
		var color="rgb("+random(0,255)+","+random(0,255)+","+random(0,255)+")";
		Dots.push({
			x:x,
			y:y,
			color:color
		});
	}
}

function resize(){
	height = box.clientHeight;
	width = box.clientWidth;
	canvas.height=height;
	canvas.width=width;

	getDots();
}
resize();

window.onresize=resize;

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w= width/size;
	for(var i = 0;i<size;i++){
		if(draw.type=="column"){
			var h = arr[i]/256 * height;
			ctx.fillRect(w*i,height-h,w*0.6,h);//
			var line = ctx.createLinearGradient(0,0,0,height);
			line.addColorStop(0,"red");
			line.addColorStop(0.5,"yellow");
			line.addColorStop(1,"green");
			ctx.fillStyle=line;
		}else if(draw.type=="dot"){
			ctx.beginPath();
            var o=Dots[i];
			var r=arr[i]/256*50;
			ctx.arc(o.x,o.y,r,0,Math.PI*2,true);
			/*ctx.strokeStyle="#fff";
			ctx.stroke();*/
			var g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
			g.addColorStop(0,"#fff");
			g.addColorStop(1,o.color);
			ctx.fillStyle=g;
			ctx.fill();
		}else{

		}
	}
}

draw.type="column";   //默认draw函数上的type属性为column
var types = $("#type li");
for(var i=0;i<types.length;i++){
	types[i].onclick=function(){
		for(var j=0;j<types.length;j++){
			types[j].className="";
		}
		this.className="selected";
		draw.type=this.getAttribute("data-type");
	}
}

function load(url){
 	var n = ++count;  //用来解决连续快速点击两首歌曲时出现的问题
	xhr.open("get",url);
	xhr.responseType="arraybuffer";
	xhr.onload=function(){
     	if(n != count) return;  //用来解决连续快速点击两首歌曲时出现的问题，最后播放的是最后点的那首歌
     	ac.decodeAudioData(xhr.response,
     		               function(buffer){
     		               	    if(n != count) return;  //用来解决连续快速点击两首歌曲时出现的问题
     		               		var bufferSource = ac.createBufferSource();   
     		               		bufferSource.buffer = buffer;   
     		               		//因为只能赋一次值，所以要在回调函数内创建buffersource
     		               		bufferSource.connect(analyser);
     		               		bufferSource[bufferSource.start?"start":"noteOn"](0);
     		               		bs=bufferSource; 
     		               		//当点击完一首歌又赶紧点另一首歌时，这里的bs 赋值可能不成功，还会同时播放多首歌曲  
     		               		//visualizer();  不能放在这里，如果放在这里的话每一次播放的话就会调用一次，这样就会有多个这个函数在执行
     		               },
     		               function(err){
     		               		console.log(err);
     		               }
     		               );
     }
     xhr.send();
 }
function visualizer(){
	var arr = new Uint8Array(analyser.frequencyBinCount);
	//获得动画函数
	requestAnimationFrame=window.requestAnimationFrame||
						  window.webkitRequestAnimationFrame||
						  window.mozRequestAnimationFrame;
	function v(){
		analyser.getByteFrequencyData(arr);
		draw(arr);
		requestAnimationFrame(v);
	}

	requestAnimationFrame(v);
}

visualizer();   
 function changevol(percent){
 	gn.gain.value=percent*percent;
 }

 $("#vol")[0].onchange = function(){
	changevol(this.value/this.max);
 }
 
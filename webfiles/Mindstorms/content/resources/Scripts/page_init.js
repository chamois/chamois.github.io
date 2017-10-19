//---------------------------------------------------
//---------MadCap page initializer ------------------
//---------------------------------------------------
// Created : 02/10/2016 
// LastEdit: 11/03/2016

// Updates and apply features that could not be done through MadCap

//---------------------------------------------------
//---------------------------------------------------


//look for firefox
var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;


//loads external elements. We ended up doing this because Madcap
//has no option to import differently depending on target
loadImports();

$(document).ready(function(){


	var doc = $(this);

	//features

	//Updates header text to match title of its breadcrumb
	appendHeaderText(doc);

	// Place Prev and Next button on each activity pages
	appendTOCPrevNextButtons(doc);
	//deployRecursivePrevNextButtons(doc); //old. Not using this.
	
	// Display versioning (last modified date)
	appendVersioning(document);

	//index page operations
	showIndex();
	highlightTeacherDocs(doc);
	completeIndexPages(doc);

	// Apply smooth scroll effect on anchor links	
	applySmoothScroll(doc);

	// Apply missing attributes to tags.
	// Look inside function for list of targets
	applyMissingAttr(doc);

	// Convert Glossery wiht image if applicable
	applyGlossaryImage(doc);

	//deliverable specific: display level for EFK
	applyEFKLevel(doc);
	
	//captionproblem
	//correctFigcaptionProblem(doc);
		
	//SandBloqs operations
	enterSandBloqsMode();//enterSandBloqsMode
	exitSandBloqsMode();//exitSandBloqsMode
		
	//accordion
	accordion();
	
	//start syntax highlighter
	sh_highlightDocument();

		
});



function loadImports(){

	var css_arr = ["MainStyles-variations.css", "Navigation.css", "/sh/sh_style.css"];

	//select css appropriate to target
	var targetted_css; 
	switch($("meta[name='audience-type']").attr("content")){
		case "student":
			css_arr.push("studentStyles.css");
			css_arr.push("printStyles.css");
			break;
		case "teacher":
			css_arr.push("teacherStyles.css");
			css_arr.push("printStyles.css");
			break;
		case "cs-student":
			css_arr.push("cs-studentStyles.css");
			css_arr.push("printStyles.css");
			break;
		case "cs-teacher":
			css_arr.push("cs-teacherStyles.css");
			css_arr.push("printStyles.css");
			break;
		default:
			//no action
	}

	//load extensions
	$("meta[name='style-extension']").each(function(){
		css_arr.push($(this).attr("content"));
	});

	
	//get content root path
	var contentRootStr = getContentRootPath();

	//Apply
	for(var i=0;i<css_arr.length;i++){
		$("<link/>", {
			rel: "stylesheet",
		   	type: "text/css",
		   	href: contentRootStr + "Resources/Stylesheets/" + css_arr[i]
		}).appendTo("head");
	}
	
}

/*helper*/
function getContentRootPath(){
	//Count parents in the path
	var parentPaths = $("head").children("script[src$='page_init.js']");
	parentPaths = parentPaths.attr("src").split("../");

	var parentCount = 0;
	for(var i=0;i<parentPaths.length;i++){
		if(parentPaths[i] == ""){
			parentCount++;
		}
	}

	//Rebuild parents
	var contentRootStr = ""
	for (var i=0;i<parentCount;i++){
		contentRootStr+= "../"
	}

	return contentRootStr;
}







function appendHeaderText(doc){

	var breadcrumb_wrapper = doc.find(".MCBreadcrumbsBox_0");


	//2. start grabbing element to pick out text
	var breadcrumb_dividers = breadcrumb_wrapper.find(".MCBreadcrumbsDivider");
	var max_index = breadcrumb_dividers.length - 1;
	var text_unit = text_module = text_page = "";

	if(max_index == -1){
		//there is no breadcrumb, end script
		return;
	}
	else if(max_index >= 0){
		//grabs the following: 1) the very first, second to last, last
		text_unit = breadcrumb_dividers.eq(0).prev().text();
		text_module = breadcrumb_dividers.eq(max_index).prev().text();
		text_page = breadcrumb_dividers.eq(max_index).next().text();

		var assumed_num_element = 3; //assume there are 3 elements 
		var breadcrumb_texts = [text_unit, text_module, text_page];


		//2. exceptions: 
		//2-a: check if product is "robotc", and if yes, hide the header
		if (breadcrumb_texts[0].toLowerCase() == "robotc"){
			doc.find(".heroBannerWrapper").css({"display":"none"});
		}
		//2-b: breadcrumb has only 2 items
		if(max_index == 0){ //max index of divider. 2 items = 1 divider
			//shift
			breadcrumb_texts[0] = breadcrumb_texts[1];
			breadcrumb_texts[1] = breadcrumb_texts[2];
			breadcrumb_texts[2] = "";
		}

		//3. replace
		var title_wrapper = doc.find(".heroTextWrapper");

		var i = 0;
		title_wrapper.find("p").each(function(){
				$(this).text(breadcrumb_texts[i]);
				i++;
			});
	}
}

function enterSandBloqsMode() {
	$(".SB-ModeButton").click(function(){
			$("body").addClass("fullScreenSB");
			$('html, body').animate({ scrollTop: 0 }, 0);
		});
}

function exitSandBloqsMode() {
	$(".exitFS").click(function(){
			$("body").removeClass("fullScreenSB");
		});
}


//Universal Index Pages
function showIndex() {

	if ($(".universalIndex .selected").parents('ul').length == 2) {
		$(".universalIndex .selected").parent().addClass("showIndex");   
		$('.showIndex:has(> ul ul)').removeClass("showIndex").addClass("showIndexChildren");
		$("ul.menu._Skins_SideMenu.mc-component > li.has-children:first-of-type > a").addClass("modules");    
	
	} else if ($("html").hasClass("noGlossary")) {   
		$(".universalIndex .selected").parents().eq(2).addClass("showIndex");  
		$('.showIndex:has(> ul ul)').removeClass("showIndex").addClass("showIndexChildren");
		$(".showIndexChildren").find("a:first").addClass("selected");
		$(".universalIndex .showIndexChildren li .selected").attr("id", "current"); 
		$("ul.menu._Skins_SideMenu.mc-component > li.has-children:first-of-type > a").addClass("subModules");
		$("html, body").animate({ scrollTop: $('#current').offset().top }, 1000);

	} else {
		$("ul.menu._Skins_SideMenu.mc-component > li.has-children:first-of-type > a").addClass("topics");    
	}
}


// accordion
function accordion() {
	var acc = document.getElementsByClassName("accordion");
	var i;

	for (i = 0; i < acc.length; i++) {
		acc[i].onclick = function(){
			this.classList.toggle("active");
			this.nextElementSibling.classList.toggle("show");
		}
	}       
}


// resize stickyNav
$(window).resize(function() {
		var navWidth = $(".medium-12.large-9.columns").outerWidth();
		var sideNavWidth = $(".large-3.columns.toc-menu").width();
		$(".inpageNav").width(navWidth);
		$(".toc-menu .menu._Skins_SideMenu.mc-component").width(sideNavWidth);
	});


// stickyNav
$(window).scroll(function () {
		var sideNav = ".toc-menu .menu._Skins_SideMenu.mc-component";
		var windowHeight = $(window).innerHeight();
		var windowWidth = $(window).width();
		var sideNavHeight = $(sideNav).height();
		var sideNavWidth = $(sideNav).width();
		var y = $(window).scrollTop();
		
		if ( (y >= 500) && (windowHeight > sideNavHeight + 50) ) {
			$(sideNav).css({
				"margin-top": "0",
				"position": "fixed",
				"top": "0"
				});
			$(".inpageNav").css({
				"position": "fixed",
				"top": "0"
				});
			$(".inpageNavBody h3").css({
				"margin-top": "-70px",
				"padding-top": "85px"
				});
			
		} else {
			$(sideNav).css({
				"margin-top": "44px",
				"position": "relative"
				});
			$(".inpageNav").css({
				"position": "relative"
				});
			$(".inpageNavBody h3").css({
				"margin-top": "-135px",
				"padding-top": "150px"
				});
		}
	});




//.........................................
// Assumes every topic that needs to be 
// referenced is in 
function appendTOCPrevNextButtons(doc){
	
	//1. Get current topic name
	//   Safer to grab from breadcrumb it seems
	var breadcrumb_wrapper = doc.find(".MCBreadcrumbsBox_0");
	var breadcrumb_dividers = breadcrumb_wrapper.find(".MCBreadcrumbsDivider");

	//1-a. grab all elements
	var breadcrumb_crumbs = new Array();
	breadcrumb_dividers.each(function(){
			breadcrumb_crumbs.push($(this).prev());
	});	
	//last element is not included in the loop above
	breadcrumb_crumbs.push(breadcrumb_dividers.eq(breadcrumb_dividers.length - 1).next());

	//1-b. grab all text from those elements [not all of them are <a>!]
	var breadcrumb_crumb_texts = new Array();

	for(i = 0;i < breadcrumb_crumbs.length;i++){ //note: array is not a jquery object
		var crumb = breadcrumb_crumbs[i];
		breadcrumb_crumb_texts.push(crumb.text());
	}

	var curr_topic_name = breadcrumb_crumb_texts[breadcrumb_crumb_texts.length-1];
	


	//2. Spawn navigation elements
	var navWrapper = $('<div>').attr("class","navWrapper");
	var btnPrev = navWrapper.append($('<a></a>', {class: 'nav-prev'}));
	var btnNext = navWrapper.append($('<a></a>', {class: 'nav-next'}));

	//top
	doc.find("h1").after($(navWrapper).clone());

	//bottom [normal topic]
	navWrapper.attr("class", "navWrapper bottomNav"); //NOT shallow
 	var contentColumns = doc.find(".rowCenter").children(".columns:not(.toc-menu)"); 	

 	if (contentColumns.length >= 1){
		contentColumns.append($(navWrapper));
	}
	else{ // probably teacher note
		contentColumns = doc.find(".rowCenter").children(".row");
		var lastContentColumn = contentColumns.eq(contentColumns.length-1).children(".columns").eq(0);
	
		lastContentColumn.append($(navWrapper));
	}




	//3. Find the TOC menu element
	//   I need to make a lot of assumption on the structure of the side TOC menu

	var btnWrapper = doc.find(".navWrapper");

	//3-a. Check if the menu is valid
	//	   Only apply next/prev button for deepest level
	var menu = $(".toc-menu").children("ul").children("li.has-children");

	//save display setting
	var btnPrev = btnWrapper.children("a.nav-prev");
	var btnNext = btnWrapper.children("a.nav-next");
	var btnDefaultDisplay = btnPrev.css("display"); 
	btnWrapper.children("a.nav-prev").css("display","none");
	btnWrapper.children("a.nav-next").css("display","none");

	if(menu.find("ul").length <= 1){
		var max_topic_count = menu.find("li").length;

		//2-b. Find current topic link object
		var curr_topic_li_object;

		var curr_li;
		for(var i=0;i<menu.find("li").length;i++){
			curr_li = menu.find("li").eq(i);
			if (curr_topic_name == curr_li.children("a").text()){
				curr_topic_li_object = curr_li;
			}
		}
		var curr_topic_count = i; //used to check if we are on last page


		//3. Find next and previous
		if(curr_topic_li_object != undefined){
			var prev_li_obj = curr_topic_li_object.prev();
			var next_li_obj = curr_topic_li_object.next();
			var linkTo;

			if (prev_li_obj.html() !== undefined){
				linkTo = prev_li_obj.children("a").attr("href");
				btnPrev.attr("href",linkTo);
				btnPrev.css("display",btnDefaultDisplay);
			}

			
			if (next_li_obj.html() !== undefined){
				linkTo = next_li_obj.children("a").attr("href");
				btnNext.attr("href",linkTo);
				btnNext.css("display",btnDefaultDisplay);
			}
			else if(curr_topic_count == max_topic_count){
				//we are on last page
				linkTo = menu.children("a").attr("href");
				btnNext.css("display",btnDefaultDisplay);
				btnNext.attr("href",linkTo);
				btnNext.attr("isFinished", "true");
			}

			//Added by VEX on 11/02/16
			//If a "nextURL" div exists, change the "finish" link
			var nextLink1 = document.getElementsByClassName("nav-next")[0];
			var nextLink2 = document.getElementsByClassName("nav-next")[1];
			

			if(document.getElementById("nextURL")){
				var nextURL = document.getElementById("nextURL").innerHTML;
				nextLink1.setAttribute("href", nextURL);
				nextLink2.setAttribute("href", nextURL);
			}
		
		}


	}


}






//..........................................
//..........................................
// Extracts build version from the log and displays it
//..........................................
//..........................................
function appendVersioning(document){

	//editable information
	var currentVersion = "1"


	//versioning using javascript document.lastModified

	var	timeStamp = document.lastModified.split(" ");
	var dateArr = timeStamp[0].split("/"); // mm/dd/yy
	var timeArr = timeStamp[1].split(":"); // hh:mm:ss

	// re-order or re-concatonate
	dateStr = dateArr[2]+"."+dateArr[0]+"."+dateArr[1];
	timeArr.pop();
	timeStr = timeArr.join(":");

	versionStr = currentVersion + "." + dateStr+"-"+timeStr;

	//spawn
	var versionDisplay = $("<div class='versionDisplay'/>");
	versionDisplay.text(versionStr);
	versionDisplay.prependTo($(document).find("footer"));



	//versioning using build log from Madcap

	//Rebuild parent path
	/*
	var parentPaths = $("head").children("script[src$='page_init.js']");
	parentPaths = parentPaths.attr("src").split("../");
	var parentCount = parentPaths.length-1;

	//Rebuild parents
	var contentRootStr = ""
	for (var i=0;i<parentCount;i++){
		contentRootStr+= "../"
	}*/


	//find log file .mclog
	/*
	$.ajax({
		type: 'GET',
		url: contentRootStr+"CS3 - Teacher.mclog", //this references from the HTML document, not the js file.
		//dataType: 'xml',
		//data: '',
		
		success: function (data){
			alert("yes");
		},
		error: function (xhr, ajaxOptions, thrownError) {
        	//alert(xhr.status);
        	//alert(thrownError);
			try{}
			catch(e){
				alert("Cannot access XML: page cannot be fully rendered");	
			}
	  });*/
}







//..........................................
//..........................................
// Uses helper highlightTeacherDocuments() to highlight teacher elements in 
// the mini-toc on the right side ONLY.
//..........................................
//..........................................
function highlightTeacherDocs(doc){
	var menu_wrapper = $(".toc-menu").children("ul").children("li.has-children");
	var menu = menu_wrapper.children("ul.sub-menu");
	
	if(menu_wrapper.length >= 1){
		highlightTeacherDocuments(menu.find("li"), "teacher-notes-toc-li");
	}

}







/*---------------------------------------------------------
-----------------------------------------------------------
Index page lists all the pages in that section. Mini-TOC is 
used through Madcap to list the items, but the extent of what
is automated is limited. This function does anything else that
we wished were also automated but Madcap does not, such as:
- Highlights Teacher documents
- Display correct title
-----------------------------------------------------------
---------------------------------------------------------*/
function completeIndexPages(doc){

	// Pre-"unversal index" index type. Uses ".moduleContents" container. 
	if( (doc.find(".moduleTitle").length+doc.find(".moduleContents").length) >= 2){
		//index page contain at least one of .moduleTitle and .moduleContents

		//Correct the title:
		//This page cannot rely on breadcrumb since H1 information is missing.
		//Index pages are built to be as non-manual as possible. Grab from TOC instead
		var indexTitle = doc.find(".toc-menu").eq(0).find("a.selected").eq(0).text();
		
		$('head').children('title').text(indexTitle); //<title> in head
		doc.find("span.MCBreadcrumbs:last").text(indexTitle); //breadcrumb
		doc.find(".heroTextWrapper").eq(0).children(".mainHeroheading").text(indexTitle); //top header
		doc.find(".moduleTitle").children("h2").children(".moduleSubtitle").each(function(){
			if( !($(this).attr("index-markup")=="override") ){
				$(this).text(indexTitle); //box title
			}
		});
		if( !(doc.find("h1").attr("index-markup")=="override") ){
			doc.find("h1").eq(0).text(indexTitle); //h1 title	
		}
		

		//Now for the actual thing: 
		if(doc.find(".moduleTitle").eq(0).attr("index-markup") == "modular"){
			//-----TYPE 1-----
			//It's modular. Lists multiple subchapters and its children pages.

			var modc = doc.find(".moduleContents").eq(0); //clone-mother


			//1. Get Chapter title, and Subchapter titles
			var indexListObj = doc.find(".toc-menu").eq(0).find("a.selected").eq(0).parent();
			var indexTitle = indexListObj.children("a").text();
			var subchapterTitleArr = [];
			indexListObj.children("ul").eq(0).children("li").each(function(){
				subchapterTitleArr.push($(this).children("a").text());
			});

			//2. Prep containers for each 
			//2-a. Get "clean" containers
			var moduleContentsObj = modc.clone();
			moduleContentsObj.empty();
			var moduleTitleObj = doc.find(".moduleTitle").eq(0).clone();

			//2-b. Clone and paste them all
			for(var i=1;i<subchapterTitleArr.length;i++){
				moduleContentsObj.clone().insertAfter(modc);
				moduleTitleObj.clone().insertAfter(modc);
			}

			//3. prepare same ul-li environment as original
			var wrapperUl_class = modc.children("ul.mc-component").attr("class"); 
			var wrapperUl = $("<ul/>"); wrapperUl.attr("class", wrapperUl_class);
			wrapperUl.append($('<li class="has-children"/>'));
			wrapperUl.children("li.has-children").append('<a class="selected"/>');

			//4. move the subchapter content from original .moduleContnets
			var subchapterLists = modc.find("ul.sub-menu").last().parent().parent().children("li");

			doc.find(".moduleContents").each(function(index){

				//4-a. put title
				$(this).prev().find(".moduleSubtitle").text(subchapterTitleArr[index]);

				if(index==0){return true;} //skip first

				//4-b. paste native environment.
				var wrapperUl_copy = wrapperUl.clone();
				$(this).append(wrapperUl_copy);

				//4-c. paste subchapter list and apply teacher highlight
				var subchapterList_copy = subchapterLists.eq(index).children("ul.sub-menu");
				wrapperUl_copy.children("li").append(subchapterList_copy);

				highlightTeacherDocuments(subchapterList_copy.find("li"), "teacher-notes-li");
			});

			//5. now that everything is distributed, need to trim the first, clone-mother list
			subchapterList_copy = subchapterLists.eq(0).children("ul.sub-menu").clone();
			modc.empty();
			modc.append(wrapperUl.clone());
			modc.children("ul").children("li").append(subchapterList_copy);
			highlightTeacherDocuments(subchapterList_copy.find("li"), "teacher-notes-li");

		}
		else if(doc.find(".moduleContents").eq(0).attr("start-at") !== typeof undefined && doc.find(".moduleContents").eq(0).attr("start-at") > 0){
			
			var baseTOC = doc.find(".moduleContents").eq(0).children("ul").find("a.selected").next("ul");
			highlightTeacherDocuments(baseTOC.find("li"), "teacher-notes-li");			

			//1. Collect and filter out information necessary
			//1-a. Extract everything
			var startAtIndexArr = [];
			doc.find(".moduleContents").each(function(){startAtIndexArr.push($(this).attr("start-at"));
			});

			//1-b. Is it student or teacher?
			var isStudent = ( ($("meta[name='audience-type']").attr("content")=="student") ? true : false);

			//1-c. Filter out information for student or teacher depending on what course
			var tempArr = [];
			var curr;
			for(var i=0;i<startAtIndexArr.length;i++){
				if(startAtIndexArr[i].split(";").length==1){
					tempArr.push(startAtIndexArr[i]);
					continue;
				}
				else{
					var indexValue = ((isStudent) ? startAtIndexArr[i].split(";")[0] : startAtIndexArr[i].split(";")[1]);
					tempArr.push(indexValue.split("=")[indexValue.split("=").length-1]);
				}
				
			}

			startAtIndexArr = tempArr;

			//2. Split contents
			doc.find(".moduleContents").each(function(curr_index){

				if(curr_index == 0){return true;}

				//2-a. prepare same ul-li environment as original
				var modc = doc.find(".moduleContents").eq(0);
				var wrapperUl_class = modc.children("ul.mc-component").attr("class"); 
				var wrapperUl = $("<ul/>"); wrapperUl.attr("class", wrapperUl_class);
				wrapperUl.append($('<li class="has-children"/>'));
				wrapperUl.children("li.has-children").append('<a class="selected"/>');
				var targetUl = $('<ul class="sub-menu"/>');
				wrapperUl.children("li.has-children").append(targetUl);

				$(this).append(wrapperUl);

				var startIndex = startAtIndexArr[curr_index]-1;
				var endIndex = ((curr_index >= startAtIndexArr.length-1) ? baseTOC.find("li").length : startAtIndexArr[curr_index+1]-1);
				
				//2-b. copy from baseTOC and append to new box
				for(var i=startIndex;i<endIndex;i++){
					targetUl.append(baseTOC.find("li").eq(i).clone());
				}
			});

			//clean up baseTOC
			//Interesting: if I use baseTOC.find("li").length directly into the for-loop, the number changes 
			//			   each iteration because I am removing the list element. So I had to store the lenght
			//			   number separately.
			var endIndex = baseTOC.find("li").length;
			for(var j=startAtIndexArr[1]-1;j<endIndex;j++){
				baseTOC.find("li").eq(startAtIndexArr[1]-1).remove();
			}
		}
		else{
			//-----TYPE 2-----
			//Normal index. Lists just one subchapter.

			//Highlight teacher notes
			var tocList = doc.find(".moduleContents").find("li.has-children");
			tocList = tocList.eq(tocList.length-1).children(".sub-menu");

			highlightTeacherDocuments(tocList.find("li"), "teacher-notes-li");			
		}
		
	}
	// "Universal index" index type. Uses .sitemapContents.universalIndex
	else if(doc.find(".sitemapContents.universalIndex").length > 0){

		//Correct the title:
		//This page cannot rely on breadcrumb since H1 information is missing.
		//Index pages are built to be as non-manual as possible. Grab from TOC instead
		var indexTitle = doc.find(".toc-menu").eq(0).find("a.selected").eq(0).text();
		
		$('head').children('title').text(indexTitle); //<title> in head
		doc.find("span.MCBreadcrumbs:last").text(indexTitle); //breadcrumb
		doc.find(".heroTextWrapper").eq(0).children(".mainHeroheading").text(indexTitle); //Middle large header
		doc.find(".heroTextWrapper").eq(0).children(".bottomHeroheading").text(""); //Third small header


		//grab .-sub-list that most likely contain <li> that needs to be highlighted
		var indexItemsList = doc.find(".universalIndex");

		if (indexItemsList.find("li.has-children.showIndexChildren").length == 0){
			indexItemsList = doc.find(".universalIndex").find("li.has-children.showIndex");
		}else{indexItemsList = doc.find(".universalIndex").find("li.has-children.showIndexChildren");}
		indexItemsList = indexItemsList.find(".sub-menu");

		//Highlight teacher notes
		indexItemsList.each(function(){
			highlightTeacherDocuments($(this).children("li"), "teacher-notes-li");	
		});

	}
}

/*helper*/
function highlightTeacherDocuments(li, classname){
	//1. set up matches
	//1-a. make teacher matching regex
	var teacherMatchArr = ["teacher notes", "teacher guide", "teacher need to know", "teacher resources", "camp teacher notes"];
	var teacherMatches = "^"+teacherMatchArr[0];
	for (var i=1;i<teacherMatchArr.length;i++){
		teacherMatches += "|^"+teacherMatchArr[i];
	}
	var teacherRegex = new RegExp(teacherMatches, 'i');

	//1-b. make TIG matching regex (this one is for <a>)
	var pathname = "Teacher Implementation Guide";
	var TIGRegex = new RegExp(pathname);

	//2. search through list, 'li', and apply class, 'classname'
	li.each(function(){
		if ($(this).text().match(teacherRegex) || $(this).children('a').attr("href").match(TIGRegex)){
			$(this).attr("class", classname);
		}
	});
}










function applySmoothScroll(doc){

	//smooth scroll
	$('a[href^="#"]:not([href="#"])').click(function(e) {

		//issue with foundation: for some reason, when new layout is activated
		//                       (happens at window size 1025px-ish), scroll property
		//                       defaults back to 0, no matter where you are. 
		//                       so, the smoothscroll only applies to big windows.

		if($(window).width()>=1025){
		    e.preventDefault();

		    var target = this.hash;
		    var $target = $(target);
		    var topPosition = $target.offset().top;

	   		$('html, body').stop().animate({
	        	'scrollTop': topPosition
	    	}, 400, 'swing');//, function () { window.location.hash = target;});
	   	}



	});
}




function applyMissingAttr(doc){
	//1. Download links ----------------------------
	//Find all download link
	var targetFiles = [".rbg", ".rbc", ".ev3", ".sb2", ".rvlx", ".sbp", ".sbq"];

	//make css selector
	for(var i=0;i<targetFiles.length;i++){
		targetFiles[i] = 'a[href$="'+targetFiles[i]+'"]';
	}
	$(targetFiles.join(",")).each(function(){
		
		var fileName = getFileNameFromURL($(this).attr("href")); //extract name
		$(this).attr("download",fileName); //apply name
	});


	//2. Print styles ------------------------------
	//Find the print style listing
	var printStyleMarker = "printStyles";
	$('link[href$="'+printStyleMarker+'.css"]').attr("media","print");

	//alert($('link[href$="'+printStyleMarker+'.css"]').length);
}

/*helper*/
function getFileNameFromURL(url){
	var urlPathArr = url.split("/");
	return urlPathArr[urlPathArr.length-1];
}







function applyGlossaryImage(doc){

	//get content root path
	var contentRootStr = getContentRootPath();

	//find glossary image folder
	var imageFolderPath = contentRootStr + "Resources/Images/GlossaryImages/";


	//find glossary term with image indicator
	var imageMarker = "{{image}}";
	var re = new RegExp(imageMarker, 'i');
	var re_index;
	doc.find(".MCTextPopupBody.popupBody").each(function(){
		//check for image indicator
		
		re_index = $(this).html().search(re);

		if (re_index > -1){

			//get rid of marker
			$(this).html($(this).html().replace(re, ""));

			//what's the name of image again? Note: assumes name starts at 0
			var endIndex = $(this).parent().html().search(/<span/);
			var glossaryName = $(this).parent().html().substring(0,endIndex);

			
			//remove redundant glossary string
			var glssryWrapper = $(this).parent();
			glssryWrapper.contents().eq(0).wrap('<span style="display:none;"/>');
				
		
			//alert(glssryWrapper.html().substring(endIndex,glssryWrapper.html().length));
			//glssryWrapper.html(glssryWrapper.html().substring(endIndex,glssryWrapper.html().length));
			glssryWrapper.attr("text-display", "none");
			
			//append image
			var imageFilePath = imageFolderPath + glossaryName + ".png";
			$("<img/>", {
				src: imageFilePath,
				height: '50px'
			}).prependTo(glssryWrapper);

		}

	});
}






function applyEFKLevel(doc){
	var EFK_meta = $("meta[name='EFK-level']");

	//check if it is applicable
	var level;
	if(EFK_meta.length >= 1){
		level = EFK_meta.attr("content");

		//Teacher banner on the top 
		doc.find('.teacherBanner').children("p").text("Level "+level);

		//Subheader in herobanner
		doc.find('.heroTextWrapper').children(".bottomHeroheading.EFKr").text("Level "+level);

		//"Teacher version" mark on 
		doc.find('.rowCenter').children("h1").find('strong').text("Level "+level);

		//other marks: explosionTitle-subtitle	
		doc.find('.explosionTitle-subtitle').text("Level "+level);

	}
}

/*
function correctFigcaptionProblem(doc){

	if(!(is_firefox)){
		doc.find('.imgWrapper').each(function(){
		$(this).css("display","table");
	});
	}


}
*/








//------------------- UNUSED -----------------------------
//Function I wrote back when I had to search for matching topic
// in the top menu. 

function deployRecursivePrevNextButtons(doc){
	
	//1. Get current address
	var breadcrumb_wrapper = doc.find(".MCBreadcrumbsBox_0");
	var breadcrumb_dividers = breadcrumb_wrapper.find(".MCBreadcrumbsDivider");

	//1-a. grab all elements
	var breadcrumb_crumbs = new Array();
	breadcrumb_dividers.each(function(){
			breadcrumb_crumbs.push($(this).prev());
		});
	//last element is not included in the loop above
	breadcrumb_crumbs.push(breadcrumb_dividers.eq(breadcrumb_dividers.length - 1).next());

	//1-b. grab all text from those elements [not all of them are <a>!]
	var breadcrumb_crumb_texts = new Array();

	for(i = 0;i < breadcrumb_crumbs.length;i++){ //note: array is not a jquery object
		var crumb = breadcrumb_crumbs[i];
		breadcrumb_crumb_texts.push(crumb.text());
	}

	//2. Find module in the menu and grab that element
	var menu = doc.find(".navigation-wrapper").children("ul.navigation");

	var position = 0;
	var didItWork = recursivelySearchMenu(menu, breadcrumb_crumb_texts, position);
	if(didItWork == false){
		//searching failed
		var btnWrapper = doc.find(".navWrapper");
		btnWrapper.children("a.nav-prev").css("display","none");
		btnWrapper.children("a.nav-next").css("display","none");
		return;
	}


	//3. Find next and previous
	var currListObject = didItWork;
	var currListWrapper = didItWork.parent();
	var prevListObject = currListObject.prev();
	var nextListObject = currListObject.next();

	//make btns
	var btnWrapper = doc.find(".navWrapper");
	var linkTo;

	if (prevListObject.html() !== undefined){
		linkTo = prevListObject.children("a").attr("href");
		btnWrapper.children("a.nav-prev").attr("href",linkTo);
	}
	else{
		btnWrapper.children("a.nav-prev").css("display","none");
	}
	
	if (nextListObject.html() !== undefined){
		linkTo = nextListObject.children("a").attr("href");
		btnWrapper.children("a.nav-next").attr("href",linkTo);
	}
	else{
		btnWrapper.children("a.nav-next").css("display","none");
	}

}



function recursivelySearchMenu(curr_topicWrapper, crumbs, position){
	//curr_topicWrapper = <ul> element wrapping around <li> of topics
	//crumbs = breadcrumb_crumb_texts 
	//position = index looking at crumbs

	//Note: EVIL JQUERY ITERATOR .each(). DOES NOT BREAK BY "returns". 
	//		To break, it must be non-false return: return false; 
	//		Anything else is treated like "continue". SERIOUSLY?


	if(curr_topicWrapper.length <= 0 || position >= crumbs.length){ 
		//there is no next topic. This is the "tail" of the function.
		return false;
	}
	else{

		//find next matching <li>
		//Note: DO NOT USE .each() ITERATOR FOR RECURSION

		var curr_topicWrapper_lists = curr_topicWrapper.children("li");

		for(var i=0;i<curr_topicWrapper_lists.length;i++){

			var topic_li = curr_topicWrapper_lists.eq(i);
			var topic_name = topic_li.children("a").text();

			var find_this_topic_name = crumbs[position];
			if(topic_name == find_this_topic_name){
				//target found: dig deeper
				var next_topicWrapper = topic_li.children("ul.sub-menu");

				var canDigDeeper = recursivelySearchMenu(next_topicWrapper, crumbs, position + 1);
				if (canDigDeeper == false){return topic_li;}
				else{return canDigDeeper;}
			}
		}
		
				
		//could'nt find the matching topic
		//Ideally, you do not reach this point
		return false;

	}
}

//------------------- END: UNUSED -----------------------------
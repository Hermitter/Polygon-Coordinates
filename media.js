////////////////////////////
//User Media
////////////////////////////
var media = document.getElementById('media-container');
var URL = window.URL || window.webkitURL;//object to construct URLs
var originalMediaWidth;//store file width
var originalMediaHeight;//store file height
var mediaIsShrunk = false;

////////////////////////////
//File Select
////////////////////////////
//Check Browser Drag&Drop Support
if (window.File && window.FileReader && window.FileList && window.Blob) {
      //Setup the drag&drop listeners.
      var DragDropZone = document.getElementById('drop_zone');
      var fileInputZone = document.getElementById('file_selected');
      //File Entered Screen
      document.body.addEventListener('dragover', handleDragOver, false);//show Drag&Drop Zone
      //File Inputed or Dropped
      fileInputZone.addEventListener('change', handleInputedFile, false);//Handle file from input button
      DragDropZone.addEventListener('drop', handleDroppedFile, false);//Handle file & hide Drag&Drop Zone
      //File Left Screen
      DragDropZone.addEventListener('dragleave', function(){DragDropZone.style.display = "none";}, false);//hide Drag&Drop Zone
  }
//alert that there is no support
else {
    alert('The File APIs are not fully supported in this browser.');
}

window.addEventListener('resize', function() {
    if((originalMediaHeight && originalMediaHeight) !== undefined){
        var userMedia = document.getElementById('user-media');//html file element
        resize(userMedia.clientWidth,userMedia.clientHeight);
    }
});

////////////////////////////
// Functions
////////////////////////////
// - read and save user selected file
function processFile(file){
    var mediaUrl = URL.createObjectURL(file);//user's file url link
    //If Image File\\
    console.log(file.type);
    if (file.type.match('image.*')) {
        var image = new Image();//canvas image object
        image.src = mediaUrl;//point to user file
        media.innerHTML = '<img id="user-media" src="'+mediaUrl+'">'; //replace exsisting media
        canvasMediaUrl = image;//assign as canvas background
        //on image loaded
        image.onload = function(){
            originalMediaWidth = image.naturalWidth;//update original width
            originalMediaHeight = image.naturalHeight;//update original height
            resize();
        };
    }
    //If Video File\\
    else if (file.type === 	'video/mp4' ||  file.type === 	'video/webm' || file.type === 'video/ogg'){
        media.innerHTML = '<video id="user-media" muted autoplay loop src="'+mediaUrl+'">'; //replace exsisting media
        var video = document.getElementById('user-media');
        // Wait for metadata to load
        video.addEventListener('loadedmetadata', function(){
            originalMediaWidth = video.videoWidth;//update original width
            originalMediaHeight = video.videoHeight;//update original height
            resize();
        }, false); 
    }
    //Unsupported file format
    else{
        alert('Invalid File Type:\n'+'Please upload an image or mp4/webm/ogg file.');
    }
}

// - resize file width & height
function resize(){
    var userMedia = document.getElementById('user-media');//html file element
    //file is larger than 75% of website screen
    if ((originalMediaWidth >= window.innerWidth*0.75) || (originalMediaHeight >= window.innerHeight*0.75)){
        //resize media width 75% of screen size
        userMedia.setAttribute('style','width:'+ window.innerWidth*(0.75) +'px');
        mediaIsShrunk = true;
    }
    //file is smaller than website screen
    else {
        //resize media
        userMedia.setAttribute('style','width:'+ originalMediaWidth +'px');
        mediaIsShrunk = false;
    }
    //resize canvas
    canvas.width = userMedia.clientWidth;
    canvas.height = userMedia.clientHeight;
}

// - handle file chosen from button
function handleInputedFile(evt){
    evt.stopPropagation();//stop reading event
    evt.preventDefault();//prevent new tab on drop
    processFile(evt.target.files[0]);
}

// - handle file chosen from drag&drop
function handleDroppedFile(evt) {
    document.getElementById("drop_zone").style.display = "none";//remove drop overlay
    evt.stopPropagation();//stop reading event
    evt.preventDefault();//prevent new tab on drop
    processFile(evt.dataTransfer.files[0]);
}

// - file enters screen
function handleDragOver(event) {
    //check if object came from user
    if (event.dataTransfer.types) {
        //check if object is file
        for(var i = 0; i < event.dataTransfer.types.length; i++){
            if (event.dataTransfer.types[i] == "Files") {
                document.getElementById("drop_zone").style.display = "block";//show drop&zone div
                event.stopPropagation();//stop reading drop event
                event.preventDefault();//prevent leaving page on file drop
                event.dataTransfer.dropEffect = 'copy';//visual feedback
            }
        }
    }
}

// - click file select button
fileSelectClick = function(){
    document.getElementById("file_selected").click();
};

// - show url input field
function showPopup(id) {
    var popup = document.getElementById(id);
    popup.style.display = 'block';
    popup.style.height = '100%';
    console.log(id);
}
// - hide url input field
function hidePopup(id) {
    var popup = document.getElementById(id);
    popup.style.display = 'none';
    popup.style.height = '0%';
}

// - read user inputed url
function setUrlMedia(){
    var url = document.getElementById('url-input-field').value;//input field value
    var fileType = url.split(/\#|\?/)[0].split('.').pop().trim().toLowerCase();//.jpg,.mp4,etc...
    console.log('Uploaded: '+fileType);//log file type
    //if html supported video
    if (fileType === 'mp4' || fileType === 'webm' || fileType === 'ogg'){
        media.innerHTML = '<video id="user-media" muted autoplay loop src="'+url+'">';//add video to html
        fileType = 'video';//declare file as a video
    }
    //else assume it's an image file
    else{
        media.innerHTML = '<img id="user-media" src="'+url+'">';//add image to html
        fileType = 'image';//declare file as a image
    }
    var userMedia = document.getElementById('user-media');//get media element
    userMedia.addEventListener('loadedmetadata', function(){urlLoaded('video');});//add video loaded event listener
    userMedia.addEventListener('load', function(){urlLoaded('image');});//add image loaded event listener
}

// - close url insert overlay
function urlLoaded(mediaType){
    //console.log("THIS IS A "+type);
    var userMedia = document.getElementById('user-media');
    //if video
    if (mediaType === 'video'){
        originalMediaWidth = userMedia.videoWidth;//update original width
        originalMediaHeight = userMedia.videoHeight;//update original height
    }
    //if image
    else if (mediaType === 'image'){
        originalMediaWidth = userMedia.naturalWidth;//update original width
        originalMediaHeight = userMedia.naturalHeight;//update original height
    }
    //if unknown
    else{
        alert('error determining file type');
    }
    resize();//resize media to fit screen size
    hidePopup('url-insert-overlay');//hide url input field
    console.log('url loaded');
    userMedia.removeEventListener('load', urlLoaded);
    userMedia.removeEventListener('loadedmetadata', urlLoaded);
}
function s(status) {
    document.getElementById('js-status').innerHTML = status;
}

function loadFile(e) {
    // https://usefulangle.com/post/193/javascript-read-local-file
    let file = e.files[0];

    let r = new FileReader();

    // file reading started
	r.addEventListener('loadstart', function() {
	    s('reading file');
	});

	// file reading finished successfully
	r.addEventListener('load', function(read) {
        s('read file, processing');

	   // contents of file in variable     
	    let csv = read.target.result;

	    readCsv(csv);
	});

	// file reading failed
	r.addEventListener('error', function() {
	    s('error reading file, refresh and try again');
	});

	// file read progress 
	r.addEventListener('progress', function(e) {
	    if(e.lengthComputable == true) {
	    	let pcRead = Math.floor((e.loaded/e.total)*100);
	    	s(`reading file: ${pcRead}%`);
	    }
    });
    
    r.readAsText(file);
}



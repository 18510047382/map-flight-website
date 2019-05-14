function getServer(callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(JSON.parse(xmlhttp.responseText));
        }
    }

    xmlhttp.open("POST", 'http://' + document.domain + ":8000/getServer", true);
    xmlhttp.send();
}

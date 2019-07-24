map.addEventListener('click', function() {
    document.querySelector('#component-airport').classList.remove('show');
})

document.querySelector('#component-airport-closeBar').onclick = function() {
    this.classList.remove('show-component-airport-closeBar');
    document.querySelector('#component-airport').classList.remove('show');
}

var comAirportMenuIndexBtn = document.querySelector('#component-airport-menu-indexBtn'),
    comAirportMenuInfoBtn = document.querySelector('#component-airport-menu-infoBtn'),
    comAirportIndex = document.querySelector('#component-airport-index'),
    comAirportInfo = document.querySelector('#component-airport-info');

comAirportMenuIndexBtn.onclick = function() {
    comAirportMenuInfoBtn.classList.remove('component-airport-menu-act');
    this.classList.add('component-airport-menu-act');
    comAirportInfo.style.display = 'none';
    comAirportIndex.style.display = 'block';
}

comAirportMenuInfoBtn.onclick = function() {
    comAirportMenuIndexBtn.classList.remove('component-airport-menu-act');
    this.classList.add('component-airport-menu-act');
    comAirportIndex.style.display = 'none';
    comAirportInfo.style.display = 'block';
}

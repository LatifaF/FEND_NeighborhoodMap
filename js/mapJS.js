

var map;
var markers =[];
var locations =[];
var infowindow ;
var bound;



function initMap() {
    var style = [
          {
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#87232c"
              }
            ]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
              {
                "color": "#87232c"
              }
            ]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#4886d0"
              }
            ]
          }
    ];


    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat:24.713488, lng:46.675339},
        styles: style,
        mapTypeControl: false
    });

    getLocation();

}



function getLocation()
{
    var Places = new google.maps.places.PlacesService(map);
    Places.nearbySearch({
      location: {lat:24.713488, lng:46.675339},
      radius: 40000,
      type: ['restaurant']
    }, callback);

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK)
          locations = results;
        setMarkers(locations);
        ko.applyBindings(new PlaceViewModel());

    }

}

function setMarkers(arrLocation)
{
    infowindow = new google.maps.InfoWindow();
    bound = new google.maps.LatLngBounds();
    for (var i = 0 ;i < arrLocation.length ; i++) {
        var marker = new google.maps.Marker({
        position: arrLocation[i].geometry.location,
        map: map,
        title: arrLocation[i].name,
        animation: google.maps.Animation.DROP,
        id : i
        });
    markers.push(marker);
    bound.extend(marker.position);
    marker.addListener('click', function() {
        popwindow(this, infowindow,arrLocation[this.id]);
        });
    }
    map.fitBounds(bound);

    function popwindow(marker, infowindow, placeDetails)
        {
            for (var i = 0; i<markers.length ; i++) {
                markers[i].setAnimation();
            }
            marker.setAnimation(google.maps.Animation.BOUNCE);
          if(infowindow.marker != marker)
            infowindow.marker = marker;
          infowindow.addListener('closeclick',function(){
            // marker.setAnimation();
            infowindow.setMarker(null);
          });

        infowindow.setContent('<div>'+marker.title+'</div><div>Raiting: '+((placeDetails.rating != null) ? placeDetails.rating : 'there is no rating for this location')+'</div><div>Photo: <img src="'+placeDetails.photos[0].getUrl({maxWidth:200})+'&key=AIzaSyBeMiDVUV0I5J7UTRbEJnGYd9SsGNR2LZ8"></div>');
        infowindow.open(map,marker);
        }
}

var PlaceViewModel = function(){
    var self = this;


    self.query = ko.observable('');
    self.locationsAll = ko.observableArray(locations);
    self.locationsResult = ko.observableArray();
    self.search = ko.computed(function () {
        for (var i = 0; i<markers.length ; i++) {
                markers[i].setMap();
            }
        self.locationsResult = ko.observableArray([]);
        var search = self.query().toLowerCase();
        for(var i=0 ; i < self.locationsAll().length; i++)
        {   place = self.locationsAll()[i];
            if(place.name.toLowerCase().indexOf(search) >= 0)
                self.locationsResult.push(place);

        }
        setMarkers(self.locationsResult());
        return self.locationsResult();
    });

};

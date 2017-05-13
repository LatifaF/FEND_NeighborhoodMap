

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

    google.maps.event.addDomListener(window, 'resize', function(){
        map.setCenter({lat:24.713488, lng:46.675339});
    });
    infowindow = new google.maps.InfoWindow();
    getLocation();

}


// get all location and there info from foursquar api
function getLocation()
{
    $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore?ll=24.713488,46.675339&radius=100000&section=food&client_id=5NWIINLL44LBT2TXPRLYBBTRNA1QKE132ADXDLBI04FLEBIV&client_secret=HX3DQAETGBZKOTA3ZNDEEMRTXPXQG4JDT4EWFXVWBIRJXTOQ&v=20130815',
            dataType: "json",
            success: function (data) {
                locations = data.response.groups[0].items;
                setMarkers(locations);
                ko.applyBindings(new PlaceViewModel());
            },
            error: function (e) {
                alert('Foursquare data is unavailable. Please try refreshing later.');
            }
        });
}

function setMarkers(arrLocation)
{

    bound = new google.maps.LatLngBounds();
    for (var i = 0 ;i < arrLocation.length ; i++) {
        var marker = new google.maps.Marker({
        position: {
               "lat" : arrLocation[i].venue.location.lat,
               "lng" : arrLocation[i].venue.location.lng
            },
        map: map,
        title: arrLocation[i].venue.name,
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


}
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

        infowindow.setContent('<div>'+marker.title+'</div><div>Raiting: '+
            ((placeDetails.venue.rating != null) ? placeDetails.venue.rating : 'there is no rating for this location')+
            '</div><div>website: '+((placeDetails.venue.url != null) ? '<a href="'+placeDetails.venue.url+'">click here</a>': '<p>no website for this place.') +
            '</div><div>Phone number: '+((placeDetails.venue.contact.phone != null) ? '<p>'+placeDetails.venue.contact.phone+'</p>': '<p>no phone number for this place.')+'</div>');
        infowindow.open(map,marker);
        }

var PlaceViewModel = function(){
    var self = this;

    // this is the function for the list search..
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
            if(place.venue.name.toLowerCase().indexOf(search) >= 0)
                self.locationsResult.push(place);

        }
        if($(window).width() < 550)
        {
            if(search != '')
                $('.searchList').show();
            else
                $('.searchList').hide();
        }
        setMarkers(self.locationsResult());
        return self.locationsResult();
    });

    // for list clicking
    self.clickPlace = function(place)
    {
        var index = self.locationsAll().map(function(o) { return o.venue.name; }).indexOf(place.venue.name);
        markers[index].setMap(map);
        google.maps.event.trigger(markers[index], 'click');
    };

};

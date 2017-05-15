

var map;
var locations =[];
var bound;


function initMap() {
    // style for the map
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

    // for resbonsivness
    google.maps.event.addDomListener(window, 'resize', function(){
        map.setCenter({lat:24.713488, lng:46.675339});
    });

   // get all location and there info from foursquar api
    $.ajax({
            url: 'https://api.foursquare.com/v2/venues/explore?ll=24.713488,46.675339&radius=100000&section=food&client_id=5NWIINLL44LBT2TXPRLYBBTRNA1QKE132ADXDLBI04FLEBIV&client_secret=HX3DQAETGBZKOTA3ZNDEEMRTXPXQG4JDT4EWFXVWBIRJXTOQ&v=20130815',
            dataType: "json",
            success: function (data) {
                locations = data.response.groups[0].items;
                // setMarkers(locations);
                ko.applyBindings(new PlaceViewModel());
            },
            error: function (e) {
                alert('Foursquare data is unavailable. Please try refreshing later.');
            }
        });

}

var PlaceViewModel = function(){
    // save this of the modelview
    var self = this;
    // get all location int abservable array
    self.locationsAll = ko.observableArray(locations);

    var infowindow = new google.maps.InfoWindow();
    bound = new google.maps.LatLngBounds();

    // add marker for all location with needed data
    for (var i = 0 ;i < self.locationsAll().length ; i++) {
        var locationData = self.locationsAll()[i];
        var marker = new google.maps.Marker({
        position: {
               "lat" : self.locationsAll()[i].venue.location.lat,
               "lng" : self.locationsAll()[i].venue.location.lng
            },
        map: map,
        title: self.locationsAll()[i].venue.name,
        animation: google.maps.Animation.DROP,
        id : i
        });
        self.locationsAll()[i].marker =marker;
        // make sure that the marker showing in map boundry for the map to set it next
        bound.extend(self.locationsAll()[i].marker.position);

        // add listener for the marker
        (self.locationsAll()[i].marker).addListener('click', function() {
            var place ={};

            //searching for marker information
            for (var k = 0; k<self.locationsAll().length ; k++) {
                console.log(self.locationsAll()[k].venue.name);
                if(self.locationsAll()[k].venue.name.indexOf(this.title) >= 0)
                    place = self.locationsAll()[k];
                self.locationsAll()[k].marker.setAnimation();
            }

            if(infowindow.marker != this)
                infowindow.marker = this;

            // set the animation for the clicked marker.
            this.setAnimation(google.maps.Animation.BOUNCE);
            // make the clicked marker in the center of the map
            map.setCenter(this.position);

            // listener for closing the infowindow
          infowindow.addListener('closeclick',function(){
            infowindow.marker.setAnimation();
            infowindow.setMarker(null);
          });
          // set the content of the info window
        if(place !== null)
            infowindow.setContent('<div>'+this.title+'</div><div>Raiting: '+
            ((place.venue.rating !== null) ? place.venue.rating : 'there is no rating for this location')+
            '</div><div>website: '+((place.venue.url !== null) ? '<a href="'+place.venue.url+'">click here</a>': '<p>no website for this place.') +
            '</div><div>Phone number: '+((place.venue.contact.phone !== null) ? '<p>'+place.venue.contact.phone+'</p>': '<p>no phone number for this place.')+'</div>');
        else infowindow.setContent("no content available");

        infowindow.open(map,this);
        });

    }

    map.fitBounds(bound);

    // this is the function for the list search..
    self.query = ko.observable('');
    self.locationsResult = ko.observableArray();
    self.search = ko.computed(function () {
        self.locationsResult = ko.observableArray([]);
        var search = self.query().toLowerCase();
        for(var j=0 ; j < self.locationsAll().length; j++)
        {   place = self.locationsAll()[j];
            if(place.venue.name.toLowerCase().indexOf(search) >= 0)
                {place.marker.setMap(map);
                self.locationsResult.push(place);}
            else
                place.marker.setMap();
        }
        if($(window).width() < 550)
        {
            if(search !== '')
                $('.searchList').show();
            else
                $('.searchList').hide();
        }
        return self.locationsResult();
    });

    // for list clicking
    self.clickPlace = function(place)
    {
        google.maps.event.trigger(place.marker, 'click');
    };

};

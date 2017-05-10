

    var map;
    var markers =[];
    var locations =[];
    var infowindow ;
    var bound ;

    function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          locations = results;
        infowindow = new google.maps.InfoWindow();
        bound = new google.maps.LatLngBounds();
          for (var i = 0 ;i < locations.length ; i++) {
          var marker = new google.maps.Marker({
            position: locations[i].geometry.location,
            map: map,
            title: locations[i].name,
            animation: google.maps.Animation.DROP,
            id : i
          });
          markers.push(marker);
          bound.extend(marker.position);
          marker.addListener('click', function() {
          popwindow(this, infowindow,locations[this.id]);
          });
        }
        map.fitBounds(bound);
          }

        }

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

        // locations = [
        // {title:'Riyadh Gallery Mall',location:{lat:24.743792 , lng:46.657871}},
        // {title:'Hayat Mall',location:{lat:24.744513 , lng:46.679434}},
        // {title:'Centria Mall',location:{lat:24.698573 , lng:46.684011}}];
        var uluru = {lat:24.713488, lng:46.675339};
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 15,
          center: uluru,
          styles: style,
          mapTypeControl: false
        });
        var Places = new google.maps.places.PlacesService(map);
        Places.nearbySearch({
          location: uluru,
          radius: 40000,
          type: ['restaurant']
        }, callback);

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

              infowindow.setContent('<div>'+marker.title+'</div><div>Raiting: '+((placeDetails.rating != null) ? placeDetails.rating : 'there is no rating for this location')+'</div><div>Photo: <img src="'+placeDetails.photos[0].getUrl({maxWidth:200})+'"></div>');

          infowindow.open(map,marker);

        }

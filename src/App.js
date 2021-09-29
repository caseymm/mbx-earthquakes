import React from 'react';
import './index.css';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as turf from '@turf/turf';
import {interpolateInferno} from 'd3-scale-chromatic';

mapboxgl.accessToken =
    'pk.eyJ1IjoiY2FzZXltbWlsZXIiLCJhIjoiY2lpeHY1bnJ1MDAyOHVkbHpucnB1dGRmbyJ9.TzUoCLwyeDoLjh3tkDSD4w';

export default class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lng: -98.78320225360663,
      lat: 40.45646421496375, 
      zoom: 3.5
    };
    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    const { lng, lat, zoom } = this.state;
    let loaded = false;
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: 'mapbox://styles/caseymmiler/cku4rtys61wpr18mxq5lucizx',
      center: [lng, lat],
      zoom: zoom
    });
    
    // svg.selectAll(".secondrow").data(data).enter().append("circle").attr("cx", function(d,i){return 30 + i*60}).attr("cy", 250).attr("r", 19).attr("fill", function(d){return myColor(d) })

    const params = window.location.search
    .slice(1)
    .split('&')
    .map((p) => p.split('='))
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    console.log(params);

    const postDiv = () => {
      console.log('loaded')
      // signal done
      const Div = document.createElement('div');
      Div.id = 'hidden';
      document.getElementsByClassName('map-container')[0].appendChild(Div);
    }

    setTimeout(function(){
      if(!loaded){
        window.location.reload();
      }
    }, 3000)

    async function loadData() {
      const resp = await fetch(params.url);
      const json = await resp.json();
      return json;
    }

    loadData().then(json => {
      // map.on('load', function () {
      console.log('ran load')
      json.features = json.features.filter(f => f.properties.PARAMVALUE > 1.5);
      json.features.forEach(f => {
        console.log(f.properties.PARAMVALUE*.1)
        f.properties.color = interpolateInferno(f.properties.PARAMVALUE*.1);
        f.properties.opacity = (f.properties.PARAMVALUE*.1)+.1;
      })
      
      loaded = true;
      map.addSource('data-json', {
        type: 'geojson',
        data: json,
      });

      // Add a new layer to visualize the polygon.
      map.addLayer({
        id: 'data-json-layer',
        type: 'fill',
        source: 'data-json', // reference the data source
        layout: {},
        paint: {
          // needs to assign fill color based on value
          'fill-color': {
              type: 'identity',
              property: 'color',
          },
          'fill-opacity': {
            type: 'identity',
            property: 'opacity',
          }
        },
      }, 'settlement-minor-label');
    
      const bounds = turf.bbox(json);
      map.fitBounds(bounds, { padding: 0, duration: 0 });
      setTimeout(function(){
        console.log('brb crying');
        postDiv();
      }, 5000)
    });
    // });
  }

  render() {
    return (
      <div>
        <div ref={this.mapContainer} className="map-container" />
      </div>
    );
  }
}
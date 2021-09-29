import React from 'react';
import './index.css';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as turf from '@turf/turf';
import {interpolateYlOrRd} from 'd3-scale-chromatic';

mapboxgl.accessToken =
    'pk.eyJ1IjoiY2FzZXltbWlsZXIiLCJhIjoiY2lpeHY1bnJ1MDAyOHVkbHpucnB1dGRmbyJ9.TzUoCLwyeDoLjh3tkDSD4w';


const Legend = () => {
  let array = []
  for(let i = .15; i < 1; i += .01){
    array.push(i);
  }

  return(
    <div className="legend-holder">
      <div className="legend">
        {array.map(num => (
          <div key={`item-${num}`} className={`color ${num}`} style={{backgroundColor: interpolateYlOrRd((num - .15)*1.17647058823)}}></div>
        ))}
      </div>
      <div className="labels">
        <div className="weak">weak to light shaking</div>
        <div className="moderate">moderate</div>
        <div className="very-strong">very strong</div>
        <div className="violent">violent</div>
      </div>
    </div>
  );
}

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
      style: 'mapbox://styles/caseymmiler/cku5y4h6e321517pqp2dtwj1w',
      center: [lng, lat],
      zoom: zoom
    });
    
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
        // console.log(f.properties.PARAMVALUE*.1, (f.properties.PARAMVALUE*.1 - .15)*1.17647058823)
        f.properties.color = interpolateYlOrRd((f.properties.PARAMVALUE*.1 - .15)*1.17647058823);
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
          'fill-opacity': 1
        },
      }, 'water');
      // 'settlement-minor-label'
    
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
        <Legend />
      </div>
    );
  }
}
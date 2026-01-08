'use client'

import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'
import 'leaflet-defaulticon-compatibility'
import { divIcon } from 'leaflet'

const _center = {
  lat: 51.505,
  lng: -0.09
}

function DraggableMarker({ onChange, value, useCurrentLocationState }: any) {
  const [position, setPosition] = useState(_center)
  const [currentLocation, setCurrentLocation] = useState(null)
  const markerRef = useRef(null)
  const [useCurrentLocation, setUseCurrentLocation] = useCurrentLocationState
  const map = useMap()

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker: any = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
          onChange && onChange(marker.getLatLng())
          setUseCurrentLocation(false)
        }
      }
    }),
    []
  )

  useEffect(() => {
    if ('geolocation' in navigator) {
      // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords
        setCurrentLocation({ lat: latitude, lng: longitude } as any)
        console.log('user location detected ----- ', latitude, longitude)
      })
    }

    if (value) {
      map.setView(value)
      setPosition(value)
      return
    }

    if (currentLocation) {
      map.setView(currentLocation)
      setPosition(currentLocation)
    }
  }, [])

  useEffect(() => {
    if (currentLocation && useCurrentLocation) {
      map.setView(currentLocation)
      setPosition(currentLocation)
      onChange && onChange(currentLocation)
    }
  }, [useCurrentLocation])

  useEffect(() => {
    if (value) {
      map.setView(value)
      setPosition(value)
      // onChange && onChange(value);
    }
  }, [value])

  return (
    <Marker
      icon={divIcon({
        html: `<svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.0002 38C14.0002 38 0.700195 20.653 0.700195 13.3C0.700195 11.5534 1.04421 9.82394 1.7126 8.21031C2.38099 6.59668 3.36066 5.1305 4.59567 3.89548C5.83069 2.66046 7.29688 1.68079 8.91051 1.0124C10.5241 0.344015 12.2536 0 14.0002 0C15.7468 0 17.4763 0.344015 19.0899 1.0124C20.7035 1.68079 22.1697 2.66046 23.4047 3.89548C24.6397 5.1305 25.6194 6.59668 26.2878 8.21031C26.9562 9.82394 27.3002 11.5534 27.3002 13.3C27.3002 20.653 14.0002 38 14.0002 38ZM14.0002 17.1C15.008 17.1 15.9746 16.6996 16.6872 15.987C17.3998 15.2744 17.8002 14.3078 17.8002 13.3C17.8002 12.2922 17.3998 11.3256 16.6872 10.613C15.9746 9.90036 15.008 9.5 14.0002 9.5C12.9924 9.5 12.0258 9.90036 11.3132 10.613C10.6006 11.3256 10.2002 12.2922 10.2002 13.3C10.2002 14.3078 10.6006 15.2744 11.3132 15.987C12.0258 16.6996 12.9924 17.1 14.0002 17.1Z" fill="#7114E8"/>
</svg>`
      })}
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  )
}

const Map = ({ onChange, value }: any) => {
  const [center] = useState(_center)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)

  return (
    <div>
      {/* <div className={'flex items-center py-2'}>
        <Checkbox
          id={'useCurrentLocation'}
          checked={useCurrentLocation}
          onCheckedChange={checked => setUseCurrentLocation(checked as boolean)}
        />
        <label htmlFor={'useCurrentLocation'} className={'ml-2'}>
          Use current location
        </label>
      </div> */}
      <MapContainer
        className={'h-[350px] w-full rounded-xl'}
        center={center}
        zoom={13}
      >
        <TileLayer
          attribution="&copy; <a href='https://maps.google.com'>Google Maps</a>"
          url={`http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`}
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />
        <DraggableMarker
          value={value}
          onChange={onChange}
          useCurrentLocationState={[useCurrentLocation, setUseCurrentLocation]}
        />
      </MapContainer>
    </div>
  )
}

export default Map

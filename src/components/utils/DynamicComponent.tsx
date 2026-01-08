import React from 'react'

interface DynamicComponentProps {
  component: React.ComponentType<any> // Allows any component type
  [key: string]: any // Allows additional props
}

const DynamicComponent: React.FC<DynamicComponentProps> = ({
  component: Component,
  ...props
}) => {
  return <Component {...props} />
}

export default DynamicComponent

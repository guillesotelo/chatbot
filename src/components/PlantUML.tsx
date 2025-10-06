import React from "react";
import plantumlEncoder from "plantuml-encoder";
import { plantUmlServer } from "../constants/app";

type PlantUMLProps = {
    code: string
}

const PlantUML: React.FC<PlantUMLProps> = ({ code }) => {
    const encoded = plantumlEncoder.encode(code)

    // svg or png
    const url = `${plantUmlServer}/svg/${encoded}`

    return <img src={url} alt="PlantUML diagram" />
}

export default PlantUML

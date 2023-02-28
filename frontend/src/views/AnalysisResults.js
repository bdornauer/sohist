import React from 'react'
import {IndividualChartsPerMetric} from "./IndividualChartsPerMetric";
import {SignificanceMetrics} from "./SignificanceMetrics";
import "./Execution.css"

class AnalysisResults extends React.Component {
    render() {
        return <div className="MyBox">
            <IndividualChartsPerMetric/>
            <SignificanceMetrics/>
        </div>
    }
}


export default AnalysisResults;

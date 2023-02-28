import {useEffect, useState} from "react";
import ReactApexChart from 'react-apexcharts'
import Button from "@mui/material/Button";

export const IndividualChartsPerMetric = () => {

    /*********************************************************
     Indiviudal charts per metric
     *********************************************************/

    const [individualChartsPerMetric, setIndividualChartsPerMetric] = useState(null);


    const [temp, setTemp] = useState(0);

    function convertMetricSeries(values) {
        var series = [];
        values.forEach(element => {
            series.push({x: new Date(element[0]).getTime(), y: element[1]})
        });

        return series;
    }

    function convertMetricOptions(name, yAxisLabel, groupName) {
        let options = {
            chart: {
                id: name, group: groupName, type: 'line', height: "160px",
            },
            xaxis: {
                type: 'datetime', formatter: function (value, timestamp, opts) {
                    return opts.dateFormatter(new Date(timestamp)).format("dd MMM")
                },
            },
            colors: ['#76d2d5'],
        }

        return options;
    }

    function sendSelectionInformation() {
        fetch("http://localhost:4040/sonarqubeAnalysisResults",)
            .then((res) => res.json())
            .then((json) => {
                let charts = [];

                json.forEach(metric=> {
                    charts.push({
                        series: [{
                            name: metric["metric_name"], data: convertMetricSeries(metric["metric_values"])
                        }], options: convertMetricOptions(metric["metric_name"], metric["metric_name"], 'metricsgroup' ),
                    })
                });

                setTemp(temp+1)
                console.log(temp)
                const newCharts = charts.map((element,index) => (<div className="col-md-6" key={"divs" + index}>
                    <h5>#{element.series[0].name}</h5>
                    <ReactApexChart options={element.options} series={element.series} type="line"
                                    key={"chart" + index}
                                    height={160}/>
                </div>))

                setIndividualChartsPerMetric(newCharts)
            })
    }

    return (<div>
        <div className="MyBox">
            <h1>Charts</h1>
            <p>
                Load the charts of specific code quality features up to the latest sonarqube analysis results.
            </p>

            <div style={{textAlign: "center"}}>
                <Button variant="outlined" onClick={() => sendSelectionInformation()}>Load & Update</Button>
            </div>

            <div className="row">
                {individualChartsPerMetric}
            </div>


        </div>
    </div>);
};
import {Alert, Form} from "react-bootstrap";
import {useState} from "react";
import ReactApexChart from 'react-apexcharts'
import Button from "@mui/material/Button";

export const SignificanceMetrics = () => {
    const [weight_bugs, setWeight_bugs] = useState(20);
    const [weight_security_hotspots, setWeight_security_hotspots] = useState(20);
    const [weight_code_smells, setWeight_code_smells] = useState(20);
    const [weight_coverage_lines, setWeight_coverage_lines] = useState(20);
    const [weight_duplicated_lines, setWeight_duplicated_lines] = useState(20);
    const [sumWeights, setSumWeights] = useState(100);

    const [chartSeries, setChartSeries] = useState([]);
    const [chartOptions, setChartOptions] = useState({});
    const [enableCharts, setEnableCharts] = useState(false)


    const handleSliderChange = (event, sliderName) => {
        const newValue = parseInt(event.target.value)
        let newSum = sumWeights

        switch (sliderName) {
            case "weight_bugs":
                newSum = newSum - weight_bugs + newValue

                setSumWeights(newSum)
                setWeight_bugs(newValue);
                break;
            case "security":
                newSum = newSum - weight_security_hotspots + newValue
                setSumWeights(newSum)
                setWeight_security_hotspots(newValue);
                break;
            case "weight_code_smells":
                newSum = newSum - weight_code_smells + newValue
                setSumWeights(newSum)
                setWeight_code_smells(newValue);

                break;
            case "coverage":
                newSum = newSum - weight_coverage_lines + newValue
                setSumWeights(newSum)
                setWeight_coverage_lines(newValue);
                break;
            case "weight_duplicated_lines":
                newSum = newSum - weight_duplicated_lines + newValue
                setSumWeights(newSum)
                setWeight_duplicated_lines(newValue);
                break;
            default:
                break;
        }


    }


    function setWeightsMetrics() {
        const data = {
            "weight_bugs": weight_bugs,
            "weight_security_hotspots": weight_security_hotspots,
            "weight_code_smells": weight_code_smells,
            "weight_coverage_lines": weight_coverage_lines,
            "weight_duplicated_lines": weight_duplicated_lines
        }
        console.log(data)

        fetch('http://127.0.0.1:4040/setWeightsMetrics', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);


                setChartOptions({
                    chart: {
                        id: "basic-line"
                    }, xaxis: {
                        categories: data["dates"], type: 'datetime', formatter: function (value, timestamp, opts) {
                            return opts.dateFormatter(new Date(timestamp)).format("dd MMM")
                        },
                    }, yaxis: {
                        labels: {
                            formatter: function (value) {
                                return value.toFixed(2);
                            }
                        }
                    }, stroke: {
                        curve: 'smooth',
                    },
                    colors: ['#76d2d5'],

                })

                setChartSeries([{
                    name: "Significance", data: data["significance"].map(value => {
                        return value.toFixed(2)
                    })
                }])

                setEnableCharts(true)

            })
            .catch((error) => {
                console.error('Error:', error);
            });


    }

    return (<div className="MyBox">
        <h1>Significance of Commits</h1>
        Distribute the 100 points to weight the relevance of the specific code quality feature.<br/>
        <br/>
        Alert-Information:
        <Alert key="warning" variant={sumWeights === 100 ? "success" : "warning"}>
            {sumWeights} must be in sum 100 - {sumWeights === 100 ? <span role="img" aria-label="sheep">✅</span> :
            <span role="img" aria-label="sheep">❌</span>}
        </Alert>

        <Form.Group controlId="reliability">
            <Form.Label>Reliability (Bugs)</Form.Label>
            <Form.Control type="range" min="0" max="100" value={weight_bugs}
                          onChange={(e) => handleSliderChange(e, "weight_bugs")}/>
            <Form.Text>{weight_bugs}</Form.Text>
        </Form.Group>
        <Form.Group controlId="security">
            <Form.Label>Security (Security Hotspots)</Form.Label>
            <Form.Control type="range" min="0" max="100" value={weight_security_hotspots}
                          onChange={(e) => handleSliderChange(e, "security")}/>
            <Form.Text>{weight_security_hotspots}</Form.Text>
        </Form.Group>
        <Form.Group controlId="maintainability">
            <Form.Label>Maintainability (Code Smells)</Form.Label>
            <Form.Control type="range" min="0" max="100" value={weight_code_smells}
                          onChange={(e) => handleSliderChange(e, "weight_code_smells")}/>
            <Form.Text>{weight_code_smells}</Form.Text>
        </Form.Group>
        <Form.Group controlId="coverage">
            <Form.Label>Coverage (Test coverage)</Form.Label>
            <Form.Control type="range" min="0" max="100" value={weight_coverage_lines}
                          onChange={(e) => handleSliderChange(e, "coverage")}/>
            <Form.Text>{weight_coverage_lines}</Form.Text>
        </Form.Group>
        <Form.Group controlId="duplications">
            <Form.Label>Duplications (Duplicated lines)</Form.Label>
            <Form.Control type="range" min="0" max="100" value={weight_duplicated_lines}
                          onChange={(e) => handleSliderChange(e, "weight_duplicated_lines")}/>
            <Form.Text>{weight_duplicated_lines}</Form.Text>
        </Form.Group>
        <div style={{textAlign: "center"}} >
             <Button variant="outlined" onClick={setWeightsMetrics} disabled={sumWeights!==100}>Send Weights & Update</Button>
        </div>

        {enableCharts ? <div>
            <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={350}
            />
        </div> : null}
    </div>);
}
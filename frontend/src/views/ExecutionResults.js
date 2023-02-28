import React, {useState, useEffect} from 'react'
import {Col, FloatingLabel, Form, Row, Spinner} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommitsTable from "../CommitsTable";
import "./Execution.css"
import Button from "@mui/material/Button";
import {Alert} from "@mui/material";

function ExecutionResults() {
    const [activationForDevelopment] = useState(false)

    //git input
    const [gitVariant, setGitVariant] = useState("gitHub");
    const [gitURL, setGitURL] = useState("");
    const [gitRepository, setGitRepository] = useState("")
    const [gitBotName, setGitBotName] = useState("")
    const [gitAccessToken, setAccessToken] = useState("")

    const [gitSuccessLoad, setGitSuccessLoad] = useState(false);

    //git filtering options
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [committers, setCommitters] = useState(["Hello"]);
    const [branches, setBranches] = useState(["Hello"]);

    //commits for analysis
    const [commitsForAnalysis, setCommitsForAnalysis] = useState([]);
    const [gitSelectionDone, setGitSelectionDone] = useState(false);

    //loading
    const [loadingPhaseGIT, setLoadingPhaseGIT] = useState(false);
    const [wrongInputWarning, setWrongInputWarning] = useState(false);
    const [loadingPhaseSonarQube, setLoadingSonarqube] = useState(false);
    const [triggeredSonarQube, setTriggeredSonarqube] = useState(false);
    const [loadingPhaseError, setLoadingPhaseError] = useState(false);


    function updateBranches(gitBranches) {
        const tempBranches = [];
        gitBranches.forEach(branchName => tempBranches.push({name: branchName, checked: false}));
        setBranches(tempBranches)
    }

    function updateCommitters(gitCommitters) {
        const tempCommitters = [];
        gitCommitters.forEach(committer => tempCommitters.push({name: committer, checked: false}));
        setCommitters(tempCommitters)
    }

    const handleChangeBranches = event => {
        console.log(event.target.value)
        const checkedBranchName = event.target.value
        const updatedCheckedState = [];

        branches.map(branch => {
            if (checkedBranchName === branch.name) {
                updatedCheckedState.push({
                    name: branch.name, checked: true
                })
            } else {
                updatedCheckedState.push({name: branch.name, checked: false})
            }

            return null
        });
        setBranches(updatedCheckedState)
        console.log(branches)
    };


    const handleChangeCommitters = event => {
        console.log(event.target.value)
        const checkedBranchName = event.target.value
        const updatedCheckedState = [];

        committers.map(committer => {
            if (checkedBranchName === committer.name) {
                updatedCheckedState.push({
                    name: committer.name, checked: !committer.checked
                })
            } else {
                updatedCheckedState.push({name: committer.name, checked: committer.checked})
            }

            return null
        });

        setCommitters(updatedCheckedState)
    };


    function sendGitInformation() {
        setLoadingPhaseGIT(true)

        const data = {
            "gitVariant": gitVariant,
            "gitURL": gitURL,
            "gitRepository": gitRepository,
            "gitBotName": gitBotName,
            "gitAccessToken": gitAccessToken
        }
        fetch('http://127.0.0.1:4040/gitInformationLogin', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('Success:', data);
                setGitSuccessLoad(true);
                setWrongInputWarning(false)
                updateBranches(data.branches)
                updateCommitters(data.committers)
                setLoadingPhaseGIT(false)
            })
            .catch((error) => {
                setWrongInputWarning(true)
                console.error('Error:', error);
            });

    }


    function sendSelectionInformation() {
        let tempBranch = "";
        const tempCommitters = [];

        committers.forEach(committer => {
            if (committer.checked) tempCommitters.push(committer.name);
        });

        branches.forEach(branch => {
            if (branch.checked) tempBranch = branch.name;
        });

        const data = {
            "startDate": startDate, "endDate": endDate, "branch": tempBranch, "committers": tempCommitters,
        }

        setGitSelectionDone(true)
        setLoadingSonarqube(true)
        setTriggeredSonarqube(true)

        fetch('http://127.0.0.1:4040/filteringOptionsSet', {
            method: 'POST', // or 'PUT'
            headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data["commits"])
                setCommitsForAnalysis(data["commits"])
                setTriggeredSonarqube(false)
            })
            .catch((error) => {
                setLoadingPhaseError(true)
                setGitSelectionDone(false)
                setLoadingSonarqube(false)
                console.error('Error:', error);
            });

        setTimeout(() => {
            fetch('http://127.0.0.1:4040/getFilteredCommits', {
                method: 'GET', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data["commits"])
                    setCommitsForAnalysis(data["commits"])

                })
                .catch((error) => {
                    console.error('Error:', error);
                });

        }, 30000);
    }


    const SelectionOption = () => (<div className="MyBox">
        {loadingPhaseError ? <Alert severity="error"> Failure - see Log-Files of Backend. </Alert> : null}

        <h2>Filter options</h2>
        <Form>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Begin date</Form.Label>
                        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)}
                                    disabled={loadingPhaseSonarQube}/>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>End date</Form.Label>
                        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}
                                    disabled={loadingPhaseSonarQube}/>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3" controlId="commiters">
                <label>Committers</label>
                <div style={{"padding-left": "10px"}}>
                    {committers.map(committer => (<Form.Check
                        type="checkbox"
                        value={committer.name}
                        label={committer.name}
                        checked={committer.checked}
                        onChange={handleChangeCommitters}
                        disabled={loadingPhaseSonarQube}
                    />))}
                </div>
            </Form.Group>

            <Form.Group className="mb-3" controlId="branches">
                <label>Branches</label>
                <div style={{"padding-left": "10px"}}>
                    {branches.map(branch => (<Form.Check
                        type="radio"
                        value={branch.name}
                        label={branch.name}
                        checked={branch.checked}
                        onChange={handleChangeBranches}
                        name="group1" disabled={loadingPhaseSonarQube}
                    />))}
                </div>
            </Form.Group>
        </Form>
        <div style={{textAlign: "center"}}>

            <Button variant="outlined" onClick={sendSelectionInformation} disabled={loadingPhaseSonarQube}>
                Set Selection & Run SonarQube-Analysis
            </Button>
        </div>
    </div>);


    return (<div className="MyBox" style={{marginLeft: "10%", marginRight: "20%"}}>
        <div className="MyBox">
            <h2>Input</h2>
            {wrongInputWarning ? <Alert severity="error"> The given git credentials are not valid. </Alert> : null}
            <Form>
                <Form.Group className="mb-3" controlId="accessTokend">
                    <label>Git-Version</label>
                    <select className="form-control" id="exampleFormControlSelect1" value={gitVariant}
                            disabled={gitSuccessLoad}
                            onChange={(e) => setGitVariant(e.target.value)}>
                        <option>GitLab</option>
                        {/*<option>GitHub</option>*/}
                    </select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="accessTokend ">
                    <FloatingLabel label="GIT-Url (e.g. https://git.uibk.ac.at)">
                        <Form.Control placeholder="Access-Token" value={gitURL} disabled={gitSuccessLoad}
                                      onChange={(e) => setGitURL(e.target.value)}/>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className="mb-3" controlId="accessToken" value={gitRepository}
                            onChange={(e) => setGitRepository(e.target.value)}>
                    <FloatingLabel label="Repository name (e.g. my-sample-project)">
                        <Form.Control placeholder="Access-Token" disabled={gitSuccessLoad}/>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className="mb-3" controlId="accessTokend ">
                    <FloatingLabel label="Username (e.g. user1)">
                        <Form.Control placeholder="Access-Token" value={gitBotName} disabled={gitSuccessLoad}
                                      onChange={(e) => setGitBotName(e.target.value)}/>
                    </FloatingLabel>
                </Form.Group>

                <Form.Group className="mb-3" controlId="accessToken">
                    <FloatingLabel label="User-Access-Token (e.g. 5w343fPXt1491P-lHrf)" value={gitAccessToken}
                                   disabled={gitSuccessLoad}
                                   onChange={(e) => setAccessToken(e.target.value)}>
                        <Form.Control placeholder="Access-Token" disabled={gitSuccessLoad}/>
                    </FloatingLabel>
                </Form.Group>
                <div style={{textAlign: "center"}}>

                    <Button variant="outlined" onClick={sendGitInformation} disabled={gitSuccessLoad}>
                        Load Git Selection Properties
                    </Button>{loadingPhaseGIT ? <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner> : null}
                </div>
            </Form>
        </div>
        {gitSuccessLoad || activationForDevelopment ? <SelectionOption/> : null}
        {gitSelectionDone || activationForDevelopment ? <div className="MyBox">
            {triggeredSonarQube ? <Spinner animation="border" role="status">
                <span className="visually-hidden">Sonarqube is running analysis...</span>
            </Spinner> : null}
            <CommitsTable commits={commitsForAnalysis}/>
        </div> : null}
    </div>);
}

export default ExecutionResults;

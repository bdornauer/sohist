import {BrowserRouter , Routes, Route} from 'react-router-dom';
import AnalysisResults from "./views/AnalysisResults";
import {Header} from "./views/Header";
import ExecutionResults from "./views/ExecutionResults";



const App = () => {
    return (
        <BrowserRouter>
            <Header/>
            <Routes>
                <Route path='/' element={<ExecutionResults/>} name="Historische Analyse"/>
                <Route path='/analysisResults'  element={<AnalysisResults/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
from flask import Flask
from flask import request
from flask_cors import CORS
import json
from GitRepository import GitRepository
import threading

app = Flask(__name__)

git_repository = GitRepository("sonarqube") # OR localhost


@app.route('/gitInformationLogin', methods=['POST'])
def git_information_login():
    response = request.get_json()
    git_repository.set_initial_git_credentials(response["gitURL"], response["gitRepository"], response["gitBotName"],
                                               response["gitAccessToken"])
    return json.dumps({
        "committers": git_repository.git_all_committers,
        "branches": git_repository.git_all_branches,
        "commits": git_repository.git_all_commits
    })




@app.route('/filteringOptionsSet', methods=['POST'])
def filteringOptionsSet():
    response = request.get_json()
    git_repository.set_selected_credentials(response["startDate"], response["endDate"], response["branch"],
                                            response["committers"])

    git_repository.execute_sonar_qube_runs()

    return json.dumps({"commits": git_repository.commits_for_analysis})

@app.route('/getFilteredCommits', methods=['GET'])
def getFilteredCommits():
    return json.dumps({"commits": git_repository.commits_for_analysis})


@app.route('/sonarqubeAnalysisResults')
def sonarqube_analysis_results():
    return json.dumps(git_repository.sonarquabe_history_results())


@app.route('/is_sonar_scanner_running')
def is_sonar_scanner_running():
    return json.dumps(git_repository.is_sonarscanner_running())


@app.route('/setWeightsMetrics', methods=['POST'])
def set_weights_metrics():
    weights = request.get_json()
    metric_results_sonarqube = git_repository.sonarquabe_history_results()

    # The number of lines do not play a rule as the difference is measured between each change.
    bugs = []
    security_hotspots = []
    code_smells = []
    coverage_lines = []
    dates = []
    duplicated_lines = []

    for metric in metric_results_sonarqube:
        metric_values = metric["metric_values"]

        if metric["metric_name"] == "bugs":
            for i in range(0, len(metric_values) - 2):
                bugs.append(abs(metric_values[i + 1][1] - metric_values[i][1]))
                dates.append(metric_values[i + 1][0])
        elif metric["metric_name"] == "security_hotspots":
            for i in range(0, len(metric_values) - 2):
                security_hotspots.append(abs(metric_values[i + 1][1] - metric_values[i][1]))
        elif metric["metric_name"] == "code_smells":
            for i in range(0, len(metric_values) - 2):
                code_smells.append(abs(metric_values[i + 1][1] - metric_values[i][1]))
        elif metric["metric_name"] == "coverage":
            for i in range(0, len(metric_values) - 2):
                coverage_lines.append(abs(metric_values[i + 1][1] - metric_values[i][1]))
        elif metric["metric_name"] == "duplicated_lines":
            for i in range(0, len(metric_values) - 2):
                duplicated_lines.append(abs(metric_values[i + 1][1] - metric_values[i][1]))

    unique_sorted_bugs = sorted(set(bugs))
    unique_sorted_security_hotspots = sorted(set(security_hotspots))
    unique_sorted_code_smells = sorted(set(code_smells))
    unique_sorted_coverage_lines = sorted(set(coverage_lines))
    unique_sorted_duplicated_lines = sorted(set(duplicated_lines))

    unique_sorted_bugs_len = len(unique_sorted_bugs)
    unique_sorted_security_hotspots_len = len(unique_sorted_security_hotspots)
    unique_sorted_code_smells_len = len(unique_sorted_code_smells)
    unique_sorted_coverage_lines_len = len(unique_sorted_coverage_lines)
    unique_sorted_duplicated_lines_len = len(unique_sorted_duplicated_lines)

    weight_bugs = weights["weight_bugs"] / 100
    weight_security_hotspots = weights["weight_security_hotspots"] / 100
    weight_code_smells = weights["weight_code_smells"] / 100
    weight_coverage_lines = weights["weight_coverage_lines"] / 100
    weight_duplicated_lines = weights["weight_duplicated_lines"] / 100

    calculated_significance = []

    for i in range(0, len(bugs) - 1):
        calculated_significance.append(weight_bugs * ((unique_sorted_bugs.index(bugs[i]) + 1)
                                                      / unique_sorted_bugs_len) +
                                       weight_security_hotspots * (
                                               (unique_sorted_security_hotspots.index(security_hotspots[i]) + 1)
                                               / unique_sorted_security_hotspots_len) +
                                       weight_code_smells * ((unique_sorted_code_smells.index(code_smells[i]) + 1)
                                                             / unique_sorted_code_smells_len) +
                                       weight_coverage_lines * (
                                               (unique_sorted_coverage_lines.index(coverage_lines[i]) + 1)
                                               / unique_sorted_coverage_lines_len) +
                                       weight_duplicated_lines * (
                                               (unique_sorted_duplicated_lines.index(duplicated_lines[i]) + 1)
                                               / unique_sorted_duplicated_lines_len)
                                       )

    respond = {
        "dates": dates,
        "significance": calculated_significance
    }

    return json.dumps(respond)


if __name__ == '__main__':
    CORS(app)
    app.run(debug=True, host='0.0.0.0', port=4040)

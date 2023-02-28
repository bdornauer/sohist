import requests
import pandas as pd
import numpy as np
import subprocess
import os
from datetime import datetime
import shutil
from SonarQubeLogic import SonarQubeLogic


class BearerAuth(requests.auth.AuthBase):
    def __init__(self, token):
        self.token = token

    def __call__(self, r):
        r.headers["authorization"] = "Bearer " + self.token
        return r


class GitRepository:

    def __init__(self, url_sonarqube):
        self.git_url = None
        self.project_name = None
        self.git_username = None
        self.access_token = None

        self.git_project_id = None
        self.git_all_commits = None
        self.git_all_committers = None
        self.git_all_branches = None
        self.path_with_namespace = None

        self.git_selected_start_date = None
        self.git_selected_end_date = None
        self.git_selected_branch = None
        self.git_selected_committers = None

        self.commits_for_analysis = None
        self.urlSonarqube = url_sonarqube
        self.sonarqube_logic = None

        self.sonarqube_is_running = False

    def set_initial_git_credentials(self, git_url, project_name, git_bot, access_token):
        self.git_url = git_url
        self.project_name = project_name
        self.git_username = git_bot
        self.access_token = access_token
        self.set_id_and_namespace()

        # order is important!
        self.git_all_branches = self.get_all_git_branches()
        self.git_all_commits = self.get_all_git_commits()
        self.git_all_committers = self.get_all_git_committers()

    def set_selected_credentials(self, git_selected_start_date, git_selected_end_date, git_selected_branches,
                                 git_selected_committers):
        self.git_selected_start_date = git_selected_start_date
        self.git_selected_branch = git_selected_branches
        self.git_selected_end_date = git_selected_end_date
        self.git_selected_committers = git_selected_committers
        self.commits_for_analysis = self.get_selected_git_commits()

    def set_id_and_namespace(self):
        api_link = "{0}/api/v4/projects?search={1}".format(self.git_url, self.project_name)
        project = requests.get(api_link, auth=BearerAuth(self.access_token)).json()
        self.path_with_namespace = project[0]["path_with_namespace"]
        self.git_project_id = project[0]["id"]

    def git_users(self):
        api_link = "{0}/api/v4/projects/{1}/users".format(self.git_url, self.git_project_id)
        print(api_link)
        users = requests.get(api_link, auth=BearerAuth(self.access_token)).json()
        return users

    def get_all_git_branches(self):
        api_link = "{0}/api/v4/projects/{1}/repository/branches?per_page=100".format(self.git_url,
                                                                                     self.git_project_id)
        print(api_link)
        branches = requests.get(api_link, auth=BearerAuth(self.access_token)).json()
        df_branches = pd.json_normalize(branches)
        df_branches_selection = df_branches[['name']]
        branches_selected = df_branches_selection.drop_duplicates()
        return np.array(branches_selected).flatten().tolist()

    def get_all_git_commits(self):
        results = []
        for branch in self.git_all_branches:
            api_link = "{0}/api/v4/projects/{1}/repository/commits?order=topo&ref_name={2}&per_page=1000000".format(
                self.git_url, self.git_project_id, branch)
            print("length branch ", branch, ": ",
                  len(requests.get(api_link, auth=BearerAuth(self.access_token)).json()))
            results.extend(requests.get(api_link, auth=BearerAuth(self.access_token)).json())

        print("Length 1: ", len(results))

        unique_commits = []
        seen_ids = set()
        for commit in results:
            if commit['id'] not in seen_ids:
                unique_commits.append(commit)
                seen_ids.add(commit['id'])

        print("Length 2: ", len(unique_commits))

        return unique_commits

    def get_all_git_committers(self):
        df_commits = pd.json_normalize(self.git_all_commits)
        df_commits_selection = df_commits[[
            'id', 'short_id', 'created_at', 'author_name']]
        df_commits_selection = df_commits_selection.iloc[::-1]
        committers = df_commits_selection[["author_name"]].drop_duplicates()
        return np.array(committers).flatten().tolist()

    def get_selected_git_commits(self):
        api_link = "{0}/api/v4/projects/{1}/repository/commits?order=topo&ref_name={2}&since={3}&until={4}" \
                   "&per_page=1000000".format(
            self.git_url, self.git_project_id, self.git_selected_branch, self.git_selected_start_date,
            self.git_selected_end_date)
        print("API-LINK to selected commits:\n \t", api_link)
        response = requests.get(api_link, auth=BearerAuth(self.access_token)).json()
        temp_commits = []
        for commit in response:
            if commit['author_name'] in self.git_selected_committers:
                temp_commits.append(commit)

        """
        for commit in temp_commits:
            date = commit['created_at'][:10]
            if date not in latest_commits:
                latest_commits[date] = commit
            elif commit['created_at'] > latest_commits[date]['created_at']:
                latest_commits[date] = commit
        filtered_commits = list(latest_commits.values())
        """

        sorted_commits_by_date = sorted(temp_commits, key=lambda x: x['created_at'], reverse=False)

        self.commits_for_analysis = sorted_commits_by_date

        return self.commits_for_analysis

    def clone_repository(self):
        new_url = self.git_url.replace("http://", "").replace("https://", "")
        url = "https://gitlab-ci-token:{0}@{1}/{2}.git".format(self.access_token, new_url,
                                                               self.path_with_namespace)
        subprocess.run(["git", "clone", url])

    @staticmethod
    def create_new_date_format(date_str):
        date_obj = datetime.fromisoformat(date_str)
        year = date_obj.year
        month = date_obj.month
        day = date_obj.day
        hours = date_obj.hour
        minutes = date_obj.minute
        seconds = date_obj.second

        return f"{year:04d}-{month:02d}-{day:02d}T{hours}:{minutes}:{seconds}+0100"

    @staticmethod
    def create_version(date_str, short_id):
        date_obj = datetime.fromisoformat(date_str)
        year = date_obj.year
        month = date_obj.month
        day = date_obj.day

        hours = date_obj.hour
        minutes = date_obj.minute

        return f"{short_id} ({day:02d}.{month:02d}.{year:04d} {hours}:{minutes})"




    def execute_sonar_qube_runs(self):
        tempPath = "/opt/backend/"  # /opt/backend/src/
        print("Before " + os.getcwd())
        os.chdir(tempPath)
        print("After " + os.getcwd())
        if os.path.exists(tempPath + self.project_name):
            shutil.rmtree(tempPath + self.project_name)

        self.clone_repository()
        self.sonarqube_logic = SonarQubeLogic(self.project_name, self.urlSonarqube)
        self.sonarqube_logic.init_admin("sohist")
        self.sonarqube_logic.create_new_project(self.project_name)
        self.sonarqube_logic.create_access_token_project(self.project_name)

        sonarquabe_project_name = self.sonarqube_logic.project_name
        sonarquabe_analysis_token = self.sonarqube_logic.analysis_token

        with open( tempPath + "/extra-sonarqube-properties.txt", 'r') as file: #adopt afterwards back with /opt/backend/src/
            # read the contents of the file
            file_contents = file.read()
            # close the file
            file.close()

        all_subdirs = [d for d in os.listdir(tempPath) if os.path.isdir(d)]
        latest_subdir = max(all_subdirs, key=os.path.getmtime)
        os.chdir(tempPath + latest_subdir)

        self.sonarqube_is_running = True

        for commit in self.commits_for_analysis:
            subprocess.run(["git", "checkout", commit["id"]])
            date = self.create_new_date_format(commit["created_at"])
            print("Date:" + date)

            project_version = self.create_version(commit["created_at"], commit["short_id"])

            sonarqube_config_file_name = 'sonar-project.properties'
            sonarqube_config_content = '''
            sonar.projectKey={0}
            sonar.login={1}
            sonar.host.url=http://{2}:9000
            sonar.sourceEncoding=UTF-8
            sonar.projectVersion={3}
            sonar.projectDate={4}
            '''.format(sonarquabe_project_name, sonarquabe_analysis_token, self.urlSonarqube, project_version,
                       date)

            sonarqube_config_content += file_contents

            if os.path.exists(sonarqube_config_file_name):
                os.remove(sonarqube_config_file_name)

            with open(sonarqube_config_file_name, 'w') as file:
                file.write(sonarqube_config_content)

            subprocess.run("sonar-scanner")
        self.sonarqube_is_running = False

    def sonarquabe_history_results(self):
        api_link = "http://{0}:9000/api/measures/search_history?metrics=ncloc,bugs,reliability_rating,security_hotspots,security_rating,code_smells,sqale_rating,coverage,duplicated_lines,duplicated_lines_density&component={1}".format(
            self.urlSonarqube, self.project_name)
        print(api_link)
        response = requests.get(api_link, auth=("admin", "sohist")).json()
        print(response)

        metric_data = []
        for metricResponse in response["measures"]:
            metric_name = metricResponse["metric"]
            metric_history = metricResponse["history"]
            values = []
            for entry in metric_history:
                if "value" in entry:
                    values.append([entry["date"], float(entry["value"])])
                else:
                    values.append([entry["date"], -1])
            metric_data.append({'metric_name': metric_name, 'metric_values': values})

        return metric_data

    def is_sonarscanner_running(self):
        return self.sonarqube_is_running

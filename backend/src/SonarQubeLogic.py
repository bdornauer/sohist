import requests


class SonarQubeLogic:
    def __init__(self, project_name, urlSonarqube):
        self.user = "admin"
        self.project_name = project_name
        self.password = "admin"
        self.analysis_token = ""
        self.urlSonarqube = urlSonarqube

    def init_admin(self, new_password):
        api_link = "http://{0}:9000/api/users/change_password?login={1}&previousPassword=admin&password={2}".format(
            self.urlSonarqube, "admin", new_password)
        response = requests.post(api_link, auth=(self.user, self.password), headers={'Accept': 'application/json'})
        self.password = new_password

    def create_new_project(self, project_name):
        api_link = "http://{0}:9000/api/projects/create?project={1}&name={2}".format(self.urlSonarqube, project_name,
                                                                                     project_name)
        response = requests.post(api_link, auth=(self.user, self.password))

    def create_access_token_project(self, project_name):
        api_link = "http://{0}:9000/api/user_tokens/generate?name={1}&projectKey={2}&type=PROJECT_ANALYSIS_TOKEN".format(
            self.urlSonarqube, project_name, project_name)
        response = requests.post(api_link, auth=(self.user, self.password)).json()
        self.analysis_token = response["token"]

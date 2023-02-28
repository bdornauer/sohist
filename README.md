![alt text](frontend/src/views/assets/SoHist-Logo.svg)

# Sohist - Historical Quality Evolution Tool

## General Information

SoHist solves adds the following features to the SonarQube Community Edition:

1. **Better Comparability**: SonarQube and possible plugins update over time so that the quality measurement approaches
   could
   change. That means, for your analysis, if you update SonarQube or plugins, the comparability of your code artifacts
   suffers.
2. **Historical Analysis at any time**: Just consider whether you take over a system or have a long-term project that
   expects a SonarQube integration. How can you analyze the history of the related project? SonarQube focuses on the
   integration of "current" commits
3. **Flexibility**: Maybe you only want to regard a specific time range of commits, analysis commits of (a) specific
   person(s) or a particular branch.

**Warning**: In its current state the **Sohist** is a prototype tool, that may lake in some functionalities and
the setup will be improved in the ongoing months.

## Docker-File (ExecutionResults)

The Docker-Compose file defines 4 services: *frontend*, *backend*, *sonarqube*, and *db*. *Frontend* and *backend* are
built from local Dockerfiles, while *sonarqube* and *db* are pulled from Docker-Hub. The *frontend* runs
the web application, while the backend acts as the *center layer* between *SonarQube*, *React* and *GitLab*.

1. Make sure that all related *volumes*, *containers* and *images* in Docker are deleted (starting with *sohist_*)
2. Execute the docker-compose.yml with `docker-compose up`
3. Now you can access the following:
    1. The WebApp (Frontend) can be accessed via [http://localhost:3000/](http://localhost:3000/).
    2. SonarQube is running on port [http://localhost:9000/](http://localhost:9000/). It can be accessed (after
       initialization via WebApp) with
        1. Username: `admin`
        2. Password: `sohist`
    3. The Backend API is accessible via [http://localhost:4040/](http://localhost:9040/).

## Triggering the Analysis

The WebApp can be accessed via [http://localhost:3000/](http://localhost:3000/).

To use the WebApp, follow these steps:

1. Fill out the `Input` form using the example provided. If the format is incorrect, an error message will appear. If
   all credentials are correct, the WebApp will load the necessary information from your GIT repository.

    - **GIT-Url:** Use `http://` or `https://`, but do not include `/` at the end. For
      example, `https://git.uibk.ac.at`.
    - **Repository name:** Include the repository name, without its path. For example, `my-sample-project`.
    - **Username:** Use your username of the git repository. For example, `user1`.
    - **USER-Access-Token:** The project access token alone is not sufficient, as the repository must be cloned. Use
      the user access token for cloning. For example, `5w343fPXt1491P-lHrf`.
2. Before executing the historical code analysis, add properties
   that are necessary for your analysis for specific languages in
   the `backend/extra-sonarqube-properties.txt` (see details [Docs Sonarqube](https://docs.sonarqube.org/9.6/analyzing-source-code/analysis-parameters/)).

3. Fill out the `Filter options` section to specify the time range of commits to include, the committers whose commits
   should be included, and the specific branch to analyze. Run the analysis 

## Analyse Results
### Included overview 
Once all included commits have been loaded, the analysis will be triggered in the backend. To view the results, switch
to the *Results inside* view (located in the Header). From there, you can load the charts and view information about the
significance of each commit.

Simply press the buttons provided to update and load the latest results in the charts of the analysis.
### Sonarqube instance  
In addition, the Sonarqube instance can be accessed via http://localhost:9000/, wither username `admin`
und password `sohist`. The project name is equal to the repository-name. 



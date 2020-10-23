# Job Funnel TS

Automated tool for scraping job postings into a .xlsx files inspired by [Job Funnel](https://github.com/PaulMcInnis/JobFunnel) and written in Typescript. Currently supports [LinkedIn](https://www.linkedin.com/), [Monster](https://www.monster.com/) (experimental), [Glassdoor](https://www.glassdoor.com/) (experimental), [Indeed](https://www.indeed.com/) (experimental).

## Usage

1. Ensure that you have Node 12.x+ installed and Yarn package manager available globally
1. Install Job Funnel as a global package: `yarn global add job-funnel`
1. Generate a new config file in a local folder: `job-funnel generate-config`
1. Update 'config.yaml' file and specify your credentials
1. Update 'pages' section in 'config.yaml' files with a list of search pages URLs. You can get a URL by running a search on a supported job website, e.g. [LinkedIn Jobs](https://www.linkedin.com/jobs/) page, and copying the URL of the results page
1. Run the crawlers: `job-funnel scan`. To run all of the supported crawlers, including experimental, specify them explicitly using '--sites' parameter: `job-funnel scan --sites linkedin monster glassdoor indeed`
1. Export the results to 'report.xlsx' file: `job-funnel export`

### Optional Steps

1. If needed, run `job-funnel wipe-db` to wipe the cached job results database
1. Run `job-funnel --debug scan` to see the crawling process. It's useful for troubleshooting sometimes. Use `job-funnel --debug scan --sites linkedin monster glassdoor indeed` to use all of the available crawlers in debug mode
1. Run `job-funnel` without any parameters to see help

### Config Example

```yaml
crawlers:
  linkedin:
    pages:
      - https://www.linkedin.com/jobs/search/?f_E=2%2C3%2C4&f_TPR=r604800&geoId=90000070&keywords=qa%20analyst&location=New%20York%20City%20Metropolitan%20Area&f_TP=1%2C2&redirect=false&position=1&pageNum=0
      - https://www.linkedin.com/jobs/search/?distance=50&f_E=2%2C3%2C4&f_TPR=r86400&geoId=104047727&keywords=qa%20analyst&location=Jersey%20City%2C%20New%20Jersey%2C%20United%20States&f_TP=1%2C2&redirect=false&position=1&pageNum=0
      - https://www.linkedin.com/jobs/search?keywords=Qa%20tester&location=New%20York%20City%20Metropolitan%20Area&geoId=90000070&trk=public_jobs_jobs-search-bar_search-submit&redirect=false&position=1&pageNum=0
    credentials:
      username: foobar@gmail.com
      password: foobarbaz
  monster:
    pages:
      - https://www.monster.com/jobs/search/Full-Time_8?q=qa-analyst&where=07302&rad=20&tm=3&jobid=220754835
    filters:
      radius: 40 # supported values: (empty), 5, 10, 20, 30, 40, 50, 60, 75, 100, 150, 200
      job_status: Full-Time # supported values: (empty), Part-Time
      posted: 1 # supported values: (empty), -1 (any date), 0 (today), 1 (yesterday), 3 (last 3 days), 7 (last 7 days), 14 (last 14 days), 30 (last 30 days)
    credentials:
      username: foo@bar.baz
      password: foobarbaz
  glassdoor:
    pages:
      - https://www.glassdoor.com/Job/jersey-city-qa-analyst-jobs-SRCH_IL.0,11_IC1126819_KO12,22.htm?jobType=fulltime&fromAge=1&radius=50
    credentials:
      username: foo@bar.baz
      password: foobarbaz
  indeed:
    pages:
      - https://www.indeed.com/jobs?q=QA%20Analyst&l=Jersey%20City%2C%20NJ&radius=50&rbl=New%20York%2C%20NY&jlid=45f6c4ded55c00bf&jt=fulltime&vjk=a573133dd9847a53
    credentials:
      username: foo@bar.baz
      password: foobarbaz
```

## Development

### Installation

1. Ensure that you have Node 12.x+ installed and Yarn package manager available globally
1. Clone the repository: `git clone https://github.com/alehkot/job-funnel-ts.git`
1. Run `yarn install`
1. Run `cp config.yaml.sample config.yaml` to create your configuration file

## Running the crawlers

1. Update 'config.yaml' file and specify your credentials
1. Update 'pages' section in 'config.yaml' files with a list of search pages URLs. You can get a URL by running a search on a supported website copying the URL of the results page
1. Use `yarn start-dev scan` to run a crawler
1. Use `yarn start-dev export` to export results into 'report.xlsx' file
(it's possible to run this command any number of times, subsequent
runs will just append new results to the database table)
1. Use `yarn start-dev wipe-db` to wipe the database
1. Use `yarn start-dev generate-config` to generate a new config file
1. Use `--debug` global flag to disable headless Puppeteer mode and increase artificial crawling delays, for example `yarn start-dev --debug scan`

## Notes

The development in the very early stages, so there might be considerable code changes in the future.

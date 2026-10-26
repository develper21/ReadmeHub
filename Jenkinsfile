pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        CI = 'true'
    }

    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm ci'
                dir('server') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
                dir('server') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
                dir('server') {
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                dir('server') {
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success {
            archiveArtifacts artifacts: 'dist/**, server/dist/**', fingerprint: true
        }
    }
}
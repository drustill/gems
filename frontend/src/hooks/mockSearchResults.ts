
export const mockSearchResults = [
    {
        name: "The Art of Programming",
        contents: `# The Art of Programming

Programming is both an art and a science. It requires creativity, logic, and attention to detail.

## Key Concepts
- Algorithms
- Data Structures
- Design Patterns
- Clean Code

### Best Practices
1. Write readable code
2. Use meaningful variable names
3. Comment complex logic
4. Test thoroughly

\`\`\`javascript
function example() {
    console.log("Hello World");
}
\`\`\`

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler

## Common Pitfalls
- Over-engineering
- Premature optimization
- Ignoring edge cases
- Not documenting code

## Resources
- [MDN Web Docs](https://developer.mozilla.org)
- [Stack Overflow](https://stackoverflow.com)
- [GitHub](https://github.com)
`
    },
    {
        name: "Machine Learning Fundamentals",
        contents: `# Machine Learning Fundamentals

Machine learning is transforming how we solve complex problems.

## Types of Learning
- Supervised Learning
- Unsupervised Learning
- Reinforcement Learning

### Popular Algorithms
1. Linear Regression
2. Decision Trees
3. Neural Networks
4. Support Vector Machines

\`\`\`python
import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1], [2], [3]])
y = np.array([2, 4, 6])
model = LinearRegression()
model.fit(X, y)
\`\`\`

## Applications
- Image Recognition
- Natural Language Processing
- Predictive Analytics
- Recommendation Systems

> "Machine learning is the science of getting computers to act without being explicitly programmed." - Andrew Ng
`
    },
    {
        name: "Web Development Best Practices",
        contents: `# Web Development Best Practices

Modern web development requires a solid understanding of multiple technologies.

## Core Technologies
- HTML5
- CSS3
- JavaScript
- TypeScript

### Frontend Frameworks
1. React
2. Vue
3. Angular
4. Svelte

\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
}

const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com"
};
\`\`\`

## Performance Optimization
- Minification
- Caching
- Lazy Loading
- Code Splitting

> "The web is a platform for everyone." - Tim Berners-Lee
`
    },
    {
        name: "Data Structures and Algorithms",
        contents: `# Data Structures and Algorithms

Understanding data structures and algorithms is crucial for efficient programming.

## Common Data Structures
- Arrays
- Linked Lists
- Stacks
- Queues
- Trees
- Graphs

### Time Complexity
- O(1) - Constant
- O(log n) - Logarithmic
- O(n) - Linear
- O(n²) - Quadratic

\`\`\`java
public class BinarySearch {
    public int search(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
\`\`\`

## Algorithm Design
- Divide and Conquer
- Dynamic Programming
- Greedy Algorithms
- Backtracking

> "The best way to predict the future is to implement it." - Alan Kay
`
    },
    {
        name: "Cloud Computing Essentials",
        contents: `# Cloud Computing Essentials

Cloud computing has revolutionized how we deploy and scale applications.

## Service Models
- IaaS (Infrastructure as a Service)
- PaaS (Platform as a Service)
- SaaS (Software as a Service)

### Major Providers
1. AWS
2. Azure
3. Google Cloud
4. IBM Cloud

\`\`\`bash
# AWS CLI example
aws s3 cp local-file.txt s3://my-bucket/
aws ec2 describe-instances
\`\`\`

## Key Concepts
- Virtualization
- Containerization
- Serverless Computing
- Microservices

> "The cloud is just someone else's computer." - Unknown
`
    },
    {
        name: "Cybersecurity Fundamentals",
        contents: `# Cybersecurity Fundamentals

Protecting digital assets is more important than ever.

## Common Threats
- Malware
- Phishing
- DDoS Attacks
- SQL Injection

### Security Best Practices
1. Use Strong Passwords
2. Enable 2FA
3. Regular Updates
4. Data Encryption

\`\`\`python
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher_suite = Fernet(key)
encrypted_text = cipher_suite.encrypt(b"Secret message")
\`\`\`

## Security Layers
- Network Security
- Application Security
- Data Security
- Physical Security

> "Security is a process, not a product." - Bruce Schneier
`
    },
    {
        name: "DevOps Practices",
        contents: `# DevOps Practices

DevOps bridges the gap between development and operations.

## Core Principles
- Continuous Integration
- Continuous Deployment
- Infrastructure as Code
- Monitoring and Logging

### Tools
1. Docker
2. Kubernetes
3. Jenkins
4. Ansible

\`\`\`yaml
# Docker Compose example
version: '3'
services:
  web:
    build: .
    ports:
      - "5000:5000"
  redis:
    image: "redis:alpine"
\`\`\`

## Benefits
- Faster Deployment
- Improved Collaboration
- Better Quality
- Increased Efficiency

> "DevOps is not a goal, but a never-ending process of continual improvement." - Jez Humble
`
    },
    {
        name: "Mobile App Development",
        contents: `# Mobile App Development

Creating engaging mobile applications requires understanding multiple platforms.

## Platforms
- iOS
- Android
- Cross-Platform

### Development Tools
1. Xcode
2. Android Studio
3. React Native
4. Flutter

\`\`\`swift
// Swift example
class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        print("Hello, iOS!")
    }
}
\`\`\`

## Key Considerations
- User Experience
- Performance
- Security
- Offline Capability

> "The best apps are those that solve real problems." - Unknown
`
    },
    {
        name: "Database Design",
        contents: `# Database Design

Effective database design is crucial for application performance.

## Database Types
- Relational
- NoSQL
- Graph
- Time-Series

### Design Principles
1. Normalization
2. Indexing
3. Relationships
4. Constraints

\`\`\`sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

## Optimization
- Query Optimization
- Schema Design
- Caching
- Partitioning

> "Data is the new oil." - Clive Humby
`
    },
    {
        name: "UI/UX Design Principles",
        contents: `# UI/UX Design Principles

Creating intuitive and engaging user interfaces requires understanding human behavior.

## Design Elements
- Color Theory
- Typography
- Layout
- Visual Hierarchy

### Design Tools
1. Figma
2. Sketch
3. Adobe XD
4. InVision

\`\`\`css
/* Example of responsive design */
.container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
}
\`\`\`

## Best Practices
- Consistency
- Accessibility
- Responsiveness
- User Feedback

> "Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs
`
    }
];



export const githubQueries = [
    'Show me a Django project with Stripe integration',
    'Show me a React application with Tailwind CSS',
    'Looking for a Node.js API boilerplate with JWT authentication',
    'Find me a Go microservices example using gRPC',
    'Need an iOS app with SwiftUI and Core Data',
    'Looking for an Angular project with NgRx state management',
    'Show me a Vue 3 eCommerce storefront with Firebase',
    'Find me a Laravel project with Vue components',
    'Example of a GraphQL Apollo Server in Node.js',
    'Show me a Spring Boot CRUD REST API tutorial',
    'Looking for Python data analysis notebooks with Pandas',
    'Find me a Flutter Firebase authentication example',
    'Show me a MERN stack boilerplate using Docker',
    'Need a Nuxt.js setup with i18n (internationalization)',
    'Looking for an Electron app with a React frontend',
    'Show me a Rails project using PostgreSQL and Redis',
    'Find me an Express.js + TypeScript starter template',
    'Looking for AWS Lambda Python examples',
    'Need a Python FastAPI real-world project',
    'Show me a Rust web framework example using Rocket',
    'Looking for a Kotlin Android MVVM architecture sample',
    'Find me a Gatsby blog with Markdown support',
    'Show me a Scala SBT project for web scraping',
    'Need Terraform modules for AWS VPC creation',
    'Looking for a Vue.js composition API demo',
    'Find me a Redux Toolkit TypeScript example',
    'Show me an ASP.NET Core minimal API project',
    'Looking for a Docker Compose setup for microservices',
    'Need a Next.js project with Tailwind and TypeScript',
    'Find me a Ruby Sinatra application demo',
    'Show me an Ionic 5 app with Angular integration',
    'Looking for a Yarn 3 monorepo setup example',
    'Need a React Native app with Expo and Firebase',
    'Find me a Python CLI tool built with Click',
    'Show me an Apache Airflow project example',
    'Looking for a Django REST Framework + React integration',
    'Need an Arduino codebase for sensor monitoring',
    'Find me a Scala Play Framework sample project',
    'Show me an Elixir Phoenix application with LiveView',
    'Looking for a Docker swarm orchestration example',
    'Need a K8s (Kubernetes) Helm chart for deploying apps',
    'Find me a .NET 6 project with Entity Framework Core',
    'Show me a RedwoodJS tutorial repository',
    'Looking for a Cross-platform .NET MAUI sample app',
    'Need a Quarkus Java project for REST APIs',
    'Find me a SvelteKit example with SSR (Server-Side Rendering)',
    'Show me a Tauri + React desktop app example',
    'Looking for a Django project featuring GraphQL integration',
    'Need a NestJS project using TypeORM and PostgreSQL',
    'Find me an Ember.js tutorial repo for beginners',
    'Show me a R Shiny web app sample',
    'Looking for a Bazel build system example',
    'Need an Android Jetpack Compose sample project',
    'Find me a TensorFlow 2 object detection tutorial in Python',
    'Show me a PyTorch project for image classification',
    'Looking for a Julia machine learning starter project',
    'Need a React Static site generator example',
    'Find me an OpenCV computer vision project in C++',
    'Show me a WordPress plugin boilerplate',
    'Looking for a WebAssembly Rust example repo',
    'Need a Django multi-tenant architecture example',
    'Find me a Node.js project that uses Mongoose and MongoDB',
    'Show me a React project with Redux-Saga',
    'Looking for a Keras deep learning example',
    'Need a Deno project that demonstrates Oak middleware',
    'Find me a Kubernetes operator built in Go',
    'Show me a Terraform project for Google Cloud',
    'Looking for a Preact minimal starter template',
    'Need an Electron + Vue scaffolding project',
    'Find me a Nim language web server example',
    'Show me a TypeScript Node CLI using Commander.js',
    'Looking for a Gin framework (Go) boilerplate',
    'Need a Scala Spark data processing example',
    'Find me a Django project using Celery and RabbitMQ',
    'Show me a VuePress documentation site setup',
    'Looking for a Laravel + Inertia.js example',
    'Need an Apache Camel integration project in Java',
    'Find me a Tailwind + Svelte workflow example',
    'Show me a Yarn Berry (v2) project monorepo',
    'Looking for a React GraphQL client with Apollo Hooks',
    'Need a Dockerfile example for multi-stage builds in Node.js',
    'Find me a Redux Toolkit + RTK Query example',
    'Show me a Strapi + Next.js headless CMS project',
    'Looking for a Python asyncio server example',
    'Need a Unity game project that demonstrates 2D physics',
    'Find me a React Native Reanimated tutorial repo',
    'Show me a Docker Compose file for WordPress + MySQL',
    'Looking for a Kotlin Ktor HTTP server example',
    'Need a Node-RED project with custom plugins',
    'Find me a Flutter project that uses BLoC for state management',
    'Show me a Julia JuMP optimization example',
    'Looking for a .NET 7 minimal API with Swagger docs',
    'Need a Bazel + Java monorepo sample',
    'Find me a RedwoodJS + Prisma database example',
    'Show me a Django custom user model and authentication system',
    'Looking for a Vite + React TypeScript starter',
    'Need a Docker Swarm stack for multiple services',
    'Find me a Django project with multi-file uploads',
    'Show me a Gatsby + Contentful blog example',
    'Looking for a Python script for web scraping with Selenium',
    'Need a LitElement web components starter repo',
    'Find me an Nx monorepo with Angular and NestJS',
    'Show me a Rails 7 app with Hotwire and Turbo Streams',
    'Looking for a Temporal (workflow engine) example in Go',
    'Need a Laravel project with TDD (Test-Driven Development) setup',
    'Find me an SSR example with Next.js and Redux',
    'Show me an AWS CDK TypeScript project for infrastructure as code',
    'Looking for a Docusaurus-based documentation site',
    'Need a Turborepo example with multiple packages'
];







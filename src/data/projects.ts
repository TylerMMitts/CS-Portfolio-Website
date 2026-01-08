export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tech: string[];
  color: string;
  fullDescription: string;
  challenges: string[];
  solutions: string[];
  fullDetail: string[];
  images: string[];
  imageDescriptions?: string[];
  pdfUrl?: string; // Optional PDF file URL
  pdfTitle?: string; // Optional PDF title
  pdfDescription?: string; // Optional PDF description
  liveUrl?: string;
  githubUrl?: string;
  duration: string;
  team: string;
  status: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Job Scheduling App",
    description:
      "Modern web application with React Expo and AWS",
    image:
      "/assets/schedulingpic.png",
    tech: [
      "React Native Expo",
      "AWS",
      "Firebase",
      "Node.js",
      "PostgreSQL",
      "Figma",
    ],
    color: "#E07A5F",
    fullDescription:
      "This project is an app for managers and employees of a company to help manage and schedule work hours for a given jobsite. ",
    challenges: [
      "Implementing a secure user authentification system",
      "Producing an app to be compatible for both Android and IOS",
      "Creating a responsive and sleek UI for a smooth user experience",
      "Securely communicating database data to the front-end",
      "Designing a scalable database that successfully link data together for cohesive data retreival",
    ],
    solutions: [
      "Implemented Firebase Authentification to handle user login and provide authentification key",
      "Used React Native Expo to deploy code for both platforms",
      "Designed UI in figma for a clean interface",
      "Implemented AWS lambda functions and IAM roles for generating temporary tokens that allow access to database",
      "Designed an appropriate EER diagram and implemented it into PostgreSQL entries, then implementing into Aurora DSQL",
    ],
    fullDetail:[
      
    ],
    images: [
      "/assets/schedulingdiagram.png",
      "/assets/schedulingpic2.png",
    ],
    imageDescriptions: [
      "Diagram of the app architecture showing React Native front-end, AWS Lambda functions, and PostgreSQL database integration",
      "Example of the mobile app interface displaying current and future features for employee scheduling and jobsite management",
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "In Production",
  },
  {
    id: 2,
    title: "Neural Network Research",
    description:
      "Research on image recognition with Python image processing",
    image:
      "/assets/nnpic.png",
    tech: ["Python", "TensorFlow", "Keras", "NumPy"],
    color: "#81B29A",
    fullDescription:
      "This project involved the design, implementation, and testing of a custom neural network to identify different items from Minecraft based on their 16x16 pixel textures. The primary goal was to determine how accurately a neural network could learn to classify these items across various texture packs.",
    challenges: [
      "Working with only 168 custom Minecraft textures",
      "Grasping the complex mathematical concepts behind neural networks, like gradient descent and backpropagation, well enough to derive and explain them clearly in my paper",
      "Verifying the network was learning correctly without standard ML frameworks and with a limited dataset",
      "Building the neural network, forward/backpropagation, and gradient descent from scratch in Python",
    ],
    solutions: [
      "Preprocessing to convert images to grayscale, flattened matrices, and normalized pixel values for efficient processing",
      "Broke down each formula step-by-step, using the chain rule to logically connect the derivatives from the cost function back to the weights and biases, creating a clear and accurate theoretical foundation",
      "Tracked prediction accuracy every 10 iterations, which provided a clear visual confirmation of learning progress and model convergence",
    ],
    fullDetail:[
      
    ],
    images: [

    ],
    imageDescriptions: [
      "Neural network architecture visualization showing convolutional layers and feature extraction process",
      "Training results dashboard displaying accuracy metrics and loss curves over training epochs",
    ],
    pdfUrl: "/assets/Neural-Network-Research.pdf", // Example - replace with actual project documentation
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "Research",
  },
  {
    id: 3,
    title: "Flashify",
    description:
      "Modern website to create sets of study flashcards",
    image:
      "/assets/flashifypic.png",
    tech: ["React", "Axios", "MongoDB"],
    color: "#F2CC8F",
    fullDescription:
      "Collaborated in a 3-person team to develop a full-stack web application for creating and studying dynamic flashcard sets. The platform allows users to create, edit, and organize custom flashcard sets for efficient studying.",
    challenges: [
      "Coordinating front-end state, server requests, and database operations for seamless Create, Read, Update, and Delete actions",
      "Efficiently handling real-time updates to flashcard sets and their individual cards without requiring a full page refresh",
      "Merging code from three developers efficiently and avoiding conflicts in both front-end components and back-end API routes",
    ],
    solutions: [
      "Established a clear data flow using Axios to connect React state changes to robust Express.js API routes, ensuring a responsive and consistent user experience",
      "Leveraged React's state and component lifecycle to manage data locally, synchronizing with the server in the background to provide instant user feedback",
      "Implemented a modular component structure and defined clear, separate API endpoints, allowing the team to work in parallel on different features with minimal merge conflicts",
    ],
    fullDetail:[
      
    ],
    images: [
      "/assets/flashifypic2.png",
    ],
    imageDescriptions: [
      "Flashcard creation interface with simple UI design",
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "3 Developers",
    status: "Prototype",
  },
  {
    id: 4,
    title: "Film Production Database",
    description:
      "MySQL design and implementation for hypothetical film production company",
    image:
      "/assets/dbpic.png",
    tech: ["MySQL", "Python"],
    color: "#81B29A",
    fullDescription:
      "MySQL database for a theoretical film production company. I developed a suite of Python functions that execute key SQL queries, enabling critical business operations like equipment reimbursement tracking, automated employee assignment notifications, and project cost analysis",
    challenges: [
      "Structuring a relational schema to accurately represent the multi-faceted relationships in film production",
      "Connecting Python application logic to the MySQL database to perform complex business operations efficiently",
      "Converting vague business requirements into precise, actionable SQL queries",
    ],
    solutions: [
      "Designed a normalized EER diagram to eliminate data redundancy and ensure integrity, creating a clear blueprint for the database",
      "Developed robust Python functions that use parameterized SQL queries to handle key tasks like cost analysis and automated notifications",
      "Mapped business logic to specific database operations, creating focused queries for reimbursement, assignment, and reporting features",
    ],
    fullDetail:[
      
    ],
    images: [
      "/assets/dbpic2.png",
      "/assets/dbpic3.png",
    ],
    imageDescriptions: [
      "EER diagram illustrating the database schema with entities, relationships, and cardinalities for film production management",
      "Function requirements mapped to specific SQL queries for key business operations like reimbursement and reporting",
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "Prototype",
  },
  {
    id: 5,
    title: "Fluid Simulation Research",
    description:
      "Research on SPH fluid simulation method and applications.",
    image:
      "/assets/fluidsimulationpic.png",
    tech: ["Simulation Software", "C4D"],
    color: "#F2CC8F",
    fullDescription:
      "Research project to evaluate the effectiveness of fluid simulation in predicting the power output of water turbines. Using Smoothed Particle Hydrodynamics (SPH) simulation software, I modeled and compared impulse and reaction turbine designs under controlled conditions. I applied fundamental fluid dynamics equations to simulate water flow and calculated power outputs for both turbine types.",
    challenges: [
      "Configuring the SPH simulator with accurate parameters (density, viscosity, initial velocity) to realistically model water and its interaction with turbine blades",
      "Applying different engineering formulas to calculate power output for two fundamentally different turbine types",
      "Addressing inherent limitations of the SPH method, including finite particle count and kernel function selection, which impact simulation realism",
    ],
    solutions: [
      "Established controlled initial conditions and constants, such as a water density of 1000 kg/m³ and initial velocity of 2 m/s, to ensure consistent and comparable results between turbine designs",
      "For the reaction turbine, used pressure change and volumetric flow, while for the impulse turbine, applied momentum change principles, ensuring accurate comparisons between designs",
      "Acknowledged these constraints in the conclusion while demonstrating the method's practical value for comparative design analysis and optimization",
    ],
    fullDetail:[
      
    ],
    images: [
    ],
    imageDescriptions: [
      "SPH fluid simulation showing particle-based water dynamics with realistic flow behavior and interactions",
      "3D visualization of fluid simulation results demonstrating complex fluid behaviors and surface tension effects",
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "Research",
    pdfUrl: "/assets/Fluid-Simulation-Research.pdf",
  },
];

// Featured projects for main page (first 3)
export const featuredProjects = projects.slice(0, 3);
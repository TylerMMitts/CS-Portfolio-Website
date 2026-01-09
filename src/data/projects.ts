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
    id: 10,
    title: "WHERETOSTARGAZE",
    description:
      "Award-winning stargazing location finder analyzing light pollution and environmental data (1st Place, TigerHacks 2025)",
    image:
      "/assets/stargazepic.png",
    tech: [
      "React",
      "FastAPI",
      "AWS S3",
      "Redis",
      "LeafletJS",
      "OpenRoute API",
    ],
    color: "#E07A5F",
    fullDescription:
      "Engineered a web application to find optimal stargazing locations by analyzing light pollution, cloud coverage, and forest density data. Built interactive map visualizations with LeafletJS using OpenRoute isochrones and distance heatmaps. Won 1st Place at TigerHacks 2025.",
    challenges: [
      "Processing and analyzing large geospatial datasets for light pollution, cloud coverage, and forest density",
      "Minimizing API costs while maintaining responsive user experience",
      "Creating intuitive interactive map visualizations for complex environmental data",
      "Storing and serving large datasets efficiently for real-time location analysis",
      "Deploying a full-stack application with multiple external API dependencies",
    ],
    solutions: [
      "Implemented Redis caching strategy to minimize API costs and reduce load times by 40%",
      "Built interactive map visualizations with LeafletJS using OpenRoute isochrones and distance heatmaps for intuitive location discovery",
      "Developed FastAPI backend for high-performance data processing and API request handling",
      "Utilized AWS S3 for efficient large dataset storage with optimized retrieval patterns",
      "Deployed full application on Vercel with seamless integration of FastAPI backend and React frontend",
    ],
    fullDetail:[
      
    ],
    images: [
    ],
    imageDescriptions: [
    ],
    liveUrl: "https://wheretostargaze.us",
    // githubUrl: "", // Add real URL when available
    duration: "36 hours (Hackathon)",
    team: "4 Developers",
    status: "Completed",
  },
  {
    id: 11,
    title: "ApplyApply",
    description:
      "Full-stack SaaS platform automating job applications with AI-powered document generation",
    image:
      "/assets/aapic.png",
    tech: [
      "React",
      "AWS Lambda",
      "AWS Bedrock",
      "AWS Aurora DSQL",
      "Elastic Beanstalk",
      "Flask",
      "Stripe",
      "Firebase",
      "Chrome Extension",
      "Vercel",
      "Axios",
    ],
    color: "#81B29A",
    fullDescription:
      "Developed a full-stack job application automation platform with React frontend and AWS serverless backend. Integrated AI-powered document generation using AWS Bedrock, Stripe payment processing, and job search API. Implemented rate limiting, caching strategies, and Firebase authentication to support a subscription-based SaaS model.",
    challenges: [
      "Integrating multiple AWS services into a cohesive serverless architecture",
      "Implementing AI-powered document generation that produces high-quality, personalized application materials",
      "Building a secure subscription-based SaaS model with payment processing and user authentication",
      "Managing API rate limits and costs across multiple external services",
      "Creating a seamless user experience across web application and Chrome extension",
    ],
    solutions: [
      "Architected serverless backend using AWS Lambda, Elastic Beanstalk, and Aurora DSQL for scalable, cost-effective operations",
      "Integrated AWS Bedrock for AI-powered resume and cover letter generation tailored to job descriptions",
      "Implemented Firebase authentication combined with Stripe payment processing for secure subscription management",
      "Developed rate limiting and caching strategies to optimize API usage and reduce operational costs",
      "Built Chrome extension integrated with React frontend deployed on Vercel for unified job application workflow",
    ],
    fullDetail:[
      
    ],
    images: [
    ],
    imageDescriptions: [
    ],
    liveUrl: "https://ApplyApply.org",
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "In Beta",
  },
  {
    id: 6,
    title: "Depth Estimation for Minecraft Builds",
    description:
      "3D reconstruction pipeline for converting 2D images into Minecraft schematics",
    image:
      "/assets/depthpic.png",
    tech: [
      "PyTorch",
      "OpenCV",
      "Scikit-Learn",
      "Scikit-Image",
      "NumPy",
      "Matplotlib",
    ],
    color: "#F2CC8F",
    fullDescription:
      "This project uses the MiDaS depth estimation model, k-means clustering, and nearest-neighbor block matching to automatically convert 2D images into 3D Minecraft schematic files. The pipeline segments depth maps, grids each cluster, maps RGB values to Minecraft blocks, and exports builds to Litematica format.",
    challenges: [
      "Choosing an accurate depth estimation model that balances precision and computational cost",
      "Determining optimal z-coordinate clustering for smooth 3D representation in block-based environment",
      "Mapping RGB values to Minecraft blocks while maintaining visual fidelity",
      "Handling build limits and scaling for large images within Minecraft's height constraints",
      "Managing long processing times for high-resolution images with small grid cells",
    ],
    solutions: [
      "Implemented MiDaS DPT Large model for high-accuracy depth estimation, accepting slower processing for creative use cases",
      "Used elbow method to automate k-value selection for k-means segmentation of depth maps",
      "Applied ball-tree nearest neighbor algorithm to match cell RGB averages to Minecraft texture colors",
      "Implemented adaptive z-scaling based on cluster depth ranges to avoid gaps and maintain proportions",
      "Optimized grid sizing with user-defined min_cell_size to balance detail and computation time",
    ],
    fullDetail:[
      
    ],
    images: [
    ],
    imageDescriptions: [
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "Completed",
    pdfUrl: "/assets/depth_report.pdf",
  },
  {
    id: 7,
    title: "Watershed Cell Segmentation & Counting",
    description:
      "Medical image analysis pipeline for segmenting and counting touching cells",
    image:
      "/assets/watershedpic.png",
    tech: [
      "OpenCV",
      "Scikit-Image",
      "NumPy",
      "Matplotlib",
    ],
    color: "#E07A5F",
    fullDescription:
      "A medical image processing pipeline that uses k-means segmentation, morphological operations, distance transforms, and watershed algorithms to separate and count touching cells in breast cancer and malaria microscopy images.",
    challenges: [
      "Separating touching cells that appear as single connected components",
      "Choosing appropriate structuring elements for morphological operations without losing cell details",
      "Detecting local maxima accurately for marker generation in distance transforms",
      "Handling cells touching image borders being ignored by distance transform",
      "Fine-tuning parameters for different cell types and image conditions",
    ],
    solutions: [
      "Applied watershed algorithm using distance transform maxima as markers to split connected cells",
      "Used elliptical structuring elements for closing and erosion to preserve cell shape while emphasizing gaps",
      "Implemented connected components labeling after local maxima detection to uniquely identify cell centers",
      "Padded masks during marker calculation and removed border artifacts in area calculations",
      "Created adjustable parameters for cluster index, minimum peak distance, and threshold per image type",
    ],
    fullDetail:[
      
    ],
    images: [
    ],
    imageDescriptions: [
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "Completed",
    pdfUrl: "/assets/watershed_report.pdf",
  },
  {
    id: 8,
    title: "Blob Detection & Nuclei Segmentation",
    description:
      "Detection and isolation of nuclei in medical images using LoG and k-means",
    image:
      "/assets/blobpic.png",
    tech: [
      "OpenCV",
      "Scikit-Image",
      "NumPy",
    ],
    color: "#81B29A",
    fullDescription:
      "This project implements Laplacian of Gaussian blob detection and k-means color segmentation to identify and isolate nuclei in cancer cell and kidney tumor microscopy images for medical analysis.",
    challenges: [
      "Reducing excessive blob detection from single intensity peaks",
      "Selecting appropriate color channels for accurate blob detection in specific structures",
      "Determining optimal k-value for k-means clustering without manual inspection",
      "Handling misaligned blob centers due to proximity filtering",
      "Creating scale-covariant blob detection across multiple standard deviations",
    ],
    solutions: [
      "Implemented dynamic LoG kernel generation based on window size and variance for flexible scale testing",
      "Used green and blue channel isolation for targeted blob detection in nuclei and specific cellular structures",
      "Applied k-means on individual color channels to isolate nuclei clusters effectively",
      "Developed proximity-based blob suppression using average blob size per scale",
      "Normalized LoG kernels to respond to local rather than global intensity variations",
    ],
    fullDetail:[
      
    ],
    images: [
    ],
    imageDescriptions: [
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "Completed",
    pdfUrl: "/assets/blob_report.pdf",
  },
  {
    id: 9,
    title: "Adaptive Median Filter Restoration",
    description:
      "Noise removal from images using adaptive window median filtering",
    image:
      "/assets/medianpic.png",
    tech: [
      "OpenCV",
      "NumPy",
      "Matplotlib",
    ],
    color: "#F2CC8F",
    fullDescription:
      "An implementation of the adaptive median filter with integral histograms to efficiently remove salt-and-pepper noise from images while preserving edges and fine details better than standard median or Gaussian filters.",
    challenges: [
      "Removing high-density salt-and-pepper noise without blurring edges",
      "Reducing computational complexity of adaptive window median calculations",
      "Balancing window size growth to avoid unnecessary processing",
      "Evaluating filter performance beyond MSE which misrepresents visual improvement",
      "Managing memory usage when storing integral histograms for large images",
    ],
    solutions: [
      "Implemented adaptive median filter that grows window size only when pixel is likely impulse noise",
      "Used integral histograms to precompute neighborhood statistics, reducing median calculation time",
      "Limited maximum window size based on distribution analysis to avoid unused large windows",
      "Relied on visual assessment alongside MSE, noting MSE's limitation for filtered image comparison",
      "Accepted increased memory usage for integral histograms to achieve faster processing times",
    ],
    fullDetail:[
      
    ],
    images: [
    ],
    imageDescriptions: [
    ],
    // liveUrl: "", // Add real URL when available
    // githubUrl: "", // Add real URL when available
    duration: "",
    team: "Solo Developer",
    status: "Completed",
    pdfUrl: "/assets/adaptive_report.pdf",
  },
  {
    id: 2,
    title: "Neural Network Research",
    description:
      "Research on image recognition with Python image processing",
    image:
      "/assets/nnpic.png",
    tech: ["Python", "TensorFlow", "Keras", "NumPy"],
    color: "#E07A5F",
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
    color: "#81B29A",
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
    color: "#F2CC8F",
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
    image: "/assets/fluidsimulationpic.png"
      ,
    tech: ["Simulation Software", "C4D"],
    color: "#E07A5F",
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
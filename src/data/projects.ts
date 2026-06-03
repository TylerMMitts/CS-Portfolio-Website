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
  videoUrl?: string; // Optional video file URL
  videoTitle?: string; // Optional video title
  videoDescription?: string; // Optional video description
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
  id: 16,
  title: "Vision-Guided CNC Automation",
  description: "YOLOv10-seg computer vision system for automated poker chip inlay drilling with sub-500ms detection and GRBL integration",
  image: "/assets/chippic.jpg",
  tech: [
    "Python",
    "YOLOv10-seg",
    "PyTorch",
    "OpenCV",
    "Streamlit",
    "PySerial",
    "GRBL",
    "NumPy",
    "SciPy"
  ],
  color: "#81B29A",
  fullDescription: "Custom poker chip manufacturing requires drilling out existing inlays to replace them with new designs (metal, resin, or client logos). However, clay poker chips often have inlays that are significantly off-center—sometimes by several millimeters—making automated drilling impossible without first detecting the true inlay position. This project solves that problem by integrating a USB endoscope camera directly into a Shapeoko 5.1 CNC machine and using computer vision to detect inlay offsets in real time. The complete vision-guided automation system handles everything from camera calibration to G-code offset correction, reducing per-chip processing time from 15 seconds to under 0.5 seconds.",
  challenges: [
    "Poker chips arrive with inlays that are inconsistently centered by several millimeters",
    "Manual centering takes 15-20 seconds per chip and introduces significant human error",
    "Inlay colors vary widely (bright colors, black-on-black, metallic), challenging traditional detection",
    "Printed graphics and text on inlays confuse standard circle detection algorithms",
    "The camera moves with the drill, creating a constantly changing viewpoint requiring dynamic calibration",
    "System must run on client's existing CNC machine with no hardware modifications beyond adding a camera",
    "Converting between coordinate systems: camera space → pixel space → machine space"
  ],
  solutions: [
    "Trained custom YOLOv10-seg model to detect both outer chip boundary and inner inlay circle simultaneously",
    "Implemented adaptive color segmentation that handles any inlay color, including challenging black-on-black",
    "Applied morphological post-processing to remove printed text and graphics from inlay surface",
    "Developed region growing algorithm for sub-pixel accurate detection boundaries (<0.5 second per chip)",
    "Created camera-to-drill offset measurement system converting pixel coordinates to GRBL machine coordinates",
    "Built Streamlit interface with live camera feed, one-click capture, and real-time offset visualization",
    "Implemented direct serial communication with GRBL controller using PySerial for real-time G-code correction via G10 L2 P1 (G54 work offset)"
  ],
  fullDetail: [],
  images: [],
  imageDescriptions: [],
  // videoUrl: "/assets/cnc.mp4",
  // videoTitle: "CNC Vision System in Action",
  // liveUrl: "",
  // githubUrl: "",
  duration: "",
  team: "Solo Developer",
  status: "Completed"
},
{
  id: 17,
  title: "3D Reconstruction into Minecraft using SfM",
  description: "VGGT transformer model for reconstructing 3D structures from image sequences and converting them to Minecraft schematics",
  image: "/assets/sfmpic.png",
  tech: [
    "PyTorch",
    "VGGT",
    "OpenCV",
    "Open3D",
    "Scikit-Image",
    "Scikit-Learn",
    "NumPy",
    "Matplotlib"
  ],
  color: "#F2CC8F",
  fullDescription: "This project expands on depth estimation techniques by implementing Structure from Motion (SfM) to create accurate 3D reconstructions from sequences of images, then converts them into Minecraft Litematica schematics. Using the VGGT (Visual Geometry Grounded Transformer) model, the pipeline processes 15-30 frames from the Temple of the Dioskouri dataset (312 total images) through a single forward pass to generate depth maps, camera pose estimations, and dense point clouds. The reconstruction is then voxelized, color-matched to Minecraft textures using ball-tree nearest neighbor search, and exported as a playable Minecraft build.",
  challenges: [
    "Converting 2D image sequences into accurate 3D spatial reconstructions",
    "Processing too many frames (312 images) caused extreme noise and unrecognizable structures",
    "VGGT model produced high camera rotation error (154.27° average) vs ground truth",
    "Scaling inaccuracies: X ratio 0.65, Y ratio 0.36 compared to ground truth bounding box",
    "Columns and fine details merged together in point cloud reconstruction",
    "Matching point cloud RGB values to Minecraft block textures accurately",
    "Filling holes between densely placed voxels to create solid structures"
  ],
  solutions: [
    "Implemented VGGT transformer for SfM through single forward pass, enabling fast and efficient reconstruction",
    "Testing revealed optimal frame count: 15-30 frames produced reasonable results vs 312 frames causing failure",
    "Applied confidence filtering with threshold t=0.92 to reduce noise and false positives in point cloud",
    "Used ball-tree nearest neighbor algorithm (O(n log n) construction, O(log n) query) for RGB to Minecraft texture mapping",
    "Developed hole-filling algorithm checking neighbor occupancy to fill gaps between voxels",
    "Voxelized point cloud by segmenting into 3D grid cells (voxel size=1) with average color assignment per cell",
    "Exported to Litematica format for automatic block placement in Minecraft"
  ],
  fullDetail: [],
  images: [],
  imageDescriptions: [],
  pdfUrl: "/assets/sfm_final.pdf",
  // liveUrl: "",
  // githubUrl: "",
  duration: "",
  team: "Solo Developer",
  status: "Completed"
  },
  {
    id: 14,
    title: "Feature Detection, Description & Matching",
    description: "Harris corner detection, MOPS descriptors, and matching techniques with RANSAC evaluation",
    image: "/assets/matchingpic.png",
    tech: ["Python", "OpenCV", "NumPy", "Scikit-Image", "Computer Vision"],
    color: "#F2CC8F",
    fullDescription: "This project implements a complete feature detection and matching pipeline including Harris corner detection, MOPS (Multi-Orientation Patch) descriptors implemented from scratch, and multiple matching techniques (distance threshold, nearest neighbor, distance ratio). The pipeline was tested on image pairs with varying similarity levels and evaluated using RANSAC for outlier removal and true positive rate calculations against ground truth homography.",
    challenges: [
      "Implementing rotation and illumination invariant MOPS descriptors from scratch",
      "Maintaining matching accuracy when images have rotation, blur, or viewpoint changes",
      "Evaluating which matching method performs best under different image conditions",
      "Removing outlier matches that degrade homography estimation quality"
    ],
    solutions: [
      "Implemented MOPS descriptors with rotation and illumination invariance for robust feature representation",
      "Applied RANSAC to eliminate outliers by iteratively finding optimal homography from random point subsets",
      "Found distance ratio matching significantly outperformed other methods on challenging images (83% TPR vs 0-3%)",
      "Demonstrated all three methods achieved 100% TPR on similar images when combined with RANSAC"
    ],
    fullDetail: [],
    images: [],
    imageDescriptions: [],
    pdfUrl: "/assets/feature_matching.pdf",
    duration: "",
    team: "Solo Developer",
    status: "Completed"
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
    id: 12,
    title: "Background Subtraction for Moving Object Segmentation",
    description: "Comparative analysis of learning rates and threshold values for foreground-background separation in video sequences",
    image: "/assets/backgroundpic.png",
    tech: ["Python", "OpenCV", "NumPy", "Computer Vision"],
    color: "#E07A5F",
    fullDescription: "Moving object segmentation is a critical application of computer vision for video analysis. This project implements and evaluates background subtraction techniques using a non-moving camera setup. Different learning rates (α = 0.001 and 0.01) and threshold values (TM = 2 and 3) were tested to analyze their impact on foreground mask quality, noise levels, and object retention.",
    challenges: [
      "Managing noise in foreground masks, especially with lower threshold values (TM = 2)",
      "Balancing background model update rates to avoid motion blur while maintaining accurate object segmentation",
      "Preventing thresholding from removing actual moving objects when using higher thresholds (TM = 3)",
      "Handling the trade-off between background model sensitivity and noise reduction"
    ],
    solutions: [
      "Implemented running mean background model with configurable learning rates for adaptive background estimation",
      "Applied threshold-based foreground detection to separate moving objects from static background",
      "Recommended post-processing techniques (dilation and erosion) to reduce noise and improve mask quality",
      "Found optimal balance with lower learning rate (α = 0.001) and higher threshold (TM = 3) for best noise reduction while preserving objects"
    ],
    fullDetail: [],
    images: [],
    imageDescriptions: [],
    pdfUrl: "/assets/background_subtraction.pdf",
    duration: "",
    team: "Solo Developer",
    status: "Completed"
  },
  {
    id: 13,
    title: "Color Edge Detection Using Structure Tensor",
    description: "Comparison of grayscale edge detection vs. 2D color structure tensor for cleaner edge extraction",
    image: "/assets/colorpic.jpg",
    tech: ["Python", "OpenCV", "Scikit-Image", "NumPy", "Matplotlib"],
    color: "#81B29A",
    fullDescription: "Edge detection is fundamental to image processing for feature extraction and information analysis. This project compares two edge detection approaches: gradient magnitude from grayscale conversion versus computing the 2D color structure tensor from RGB images. The research examines how Gaussian blur with different sigma values (σ = 1 and 3) affects edge definition and noise reduction.",
    challenges: [
      "Information loss during grayscale conversion reducing edge detection quality",
      "Balancing edge definition with noise reduction when selecting Gaussian blur parameters",
      "Maintaining accurate edge localization while smoothing inter-cell noise",
      "Combining information from multiple color channels into coherent edge detection"
    ],
    solutions: [
      "Implemented 2D color structure tensor to utilize all RGB channels simultaneously, preserving critical color information",
      "Tested multiple sigma values (σ = 1, 3) to analyze trade-off between edge definition and noise suppression",
      "Demonstrated tensor-based approach produced clearer edges with significantly less noise than grayscale method",
      "Recommended threshold post-processing to further isolate cells and remove remaining noise"
    ],
    fullDetail: [],
    images: [],
    imageDescriptions: [],
    pdfUrl: "/assets/color_edge_detection.pdf",
    duration: "",
    team: "Solo Developer",
    status: "Completed"
  },
  {
    id: 15,
    title: "CNN Image Classification on CIFAR-10",
    description: "Comparative analysis of CNN architectures for object classification with confusion matrix evaluation",
    image: "/assets/cnnpic.png",
    tech: ["PyTorch", "Python", "CNN", "NumPy", "Matplotlib"],
    color: "#E07A5F",
    fullDescription: "This project trains and evaluates convolutional neural networks for image classification on the CIFAR-10 dataset. Three different CNN architectures (Net1, Net2, Net3) were compared to analyze how layer depth, output channels, and number of classes affect classification accuracy. The research examines confusion patterns between similar-looking classes and explores how background context influences misclassifications.",
    challenges: [
      "Distinguishing visually similar classes (cats vs dogs, deer vs frogs) in challenging poses",
      "Preventing networks from learning background textures instead of object features",
      "Achieving good accuracy across all 10 classes with limited network complexity",
      "Analyzing misclassification patterns to understand model learning behavior"
    ],
    solutions: [
      "Designed progressive architectures: Net1 (baseline), Net2 (more channels + extra conv layer), Net3 (4-class for comparison)",
      "Net2 achieved 69.94% average accuracy, a 10.7% improvement over Net1's 59.24%",
      "Net3 reached 84.38% accuracy by reducing to 4 classes (Horse, Dog, Deer, Other)",
      "Identified background-biased learning: deer with blue backgrounds classified as plane, frogs in green as bird"
    ],
    fullDetail: [],
    images: [],
    imageDescriptions: [],
    pdfUrl: "/assets/image_classification.pdf",
    duration: "",
    team: "Solo Developer",
    status: "Completed"
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
  }
];

// Featured projects for main page (first 3)
export const featuredProjects = projects.slice(0, 3);
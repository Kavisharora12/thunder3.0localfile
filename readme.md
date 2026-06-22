# Thunder – JavaScript Virus

## Project Goal

This project was created as part of a JavaScript security challenge focused on understanding how software can collect system information and communicate with a remote dashboard.

The project demonstrates:

- Operating system detection
- CPU architecture collection
- Hostname collection
- Node.js version detection
- Platform information retrieval
- User home directory detection
- Selected environment variable collection
- Remote communication between a local agent and a web dashboard
- All the files can be extracted except within directory except code extention bat,exe, etc it has no path traversal in it.

## Run on downloaded on terminal

Run this on Terminal : 
cd src

node `file-agent.js`

## **Web Dashboard Features**

The Thunder web dashboard acts as the central control panel for interacting with a connected machine running the local agent `file-agent.js`).

Once the agent is running, the dashboard can perform multiple operations and display results in real time.

---

## **1. File Path Inspection**

The dashboard allows the user to enter a file path such as:

```text id="e5f9if"

C:\Users\Asus\Projects\demo.js

```

The agent reads the requested file and returns:

- File Name
- File Path
- File Size
- Last Modified Time
- File Content

The content is displayed directly inside the browser.

---

## **2. File CRUD Operations**

The dashboard supports complete file management operations:

### Create File

Create a new file with custom content.

### Read File

Read and display the contents of an existing file.

### Update File

Modify existing file contents or append additional data.

### Delete File

Remove files from the target directory.

### List Files

Browse all files and folders within a directory.

---

## **3. System Information Collection**

The dashboard can collect and display:

- Operating System Details
- CPU Architecture
- Hostname
- Node.js Version
- Platform Information
- Total Memory
- Available Memory
- User Home Directory

Example:

```json id="hw3j8t"

{

  "platform": "win32",

  "arch": "x64",

  "hostname": "DESKTOP-XXXX",

  "nodeVersion": "v24.x",

  "homeDir": "C:\\Users\\User"

}

```

---

## **4. Environment Variable Inspection**

The dashboard can retrieve selected environment variables such as:

- PATH
- HOME
- USERPROFILE
- COMPUTERNAME
- TEMP
- TMP
- NODE_ENV

This helps understand the execution environment of the connected machine.

---

## **5. Directory Exploration**

Users can enter a directory path and view:

```text id="35ov2l"

C:\Users\Asus\Projects

```

The dashboard returns:

- Files
- Subdirectories
- Extensions
- Sizes
- Modification Times

---

## **Technical Components Used**

- Node.js
- Express.js
- File System (fs)
- Operating System APIs (os)
- Environment Variables
- Fetch API
- REST APIs
- Web Dashboard UI
- Local Background Agent
- JSON Data Exchange

---

## **Project Outcome**

The project demonstrates how a web-based dashboard can interact with a local machine through a lightweight agent to perform file management, directory exploration, environment inspection, and system information collection while presenting the results through a modern browser interface.

## Architecture

```text

Web Dashboard

      │

      ▼

Thunder Server

      │

      ▼

file-agent.js

      │

      ▼

Local Machine

```

## How It Works

1. The user downloads and runs `file-agent.js`.
2. The agent connects to the Thunder dashboard.
3. The dashboard can request information from the connected machine.
4. The agent collects the requested information.
5. Results are displayed in real time.

## Demonstrated Concepts

- System reconnaissance
- File inspection
- Environment analysis
- Client-server communication
- Remote agent architecture
- Node.js operating system APIs

## Disclaimer

This project is an educational security demonstration and proof-of-concept. It does not self-replicate, infect other systems, bypass security controls, or attempt to persist on a machine after removal.
import React, { useEffect, useState } from "react";
import { useNavigate} from 'react-router-dom'; 

import { db } from "../firebase";
import { collection, addDoc, getDocs } from 'firebase/firestore';
import Papa from 'papaparse';

import Barc from './visualizations/Bar-ch'
import Piec from './visualizations/Pie-ch'
import Map from './visualizations/Iligan'
import "../css/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isUploading, setIsUploading] = useState(false); 
  const [file, setFile] = useState(null);
  const [disasters, setDisasters] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const rowsPerPage = 10;
  const totalPages = Math.ceil(disasters.length / rowsPerPage);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query //new

  //list of barangays
  const barangays = [
    "Abuno", "Acmac-Mariano Badelles Sr.", "Bagong Silang", "Bonbonon", "Bunawan", "Buru-un", "Dalipuga",
    "Del Carmen", "Digkilaan", "Ditucalan", "Dulag", "Hinaplanon", "Hindang", "Kabacsanan", "Kalilangan",
    "Kiwalan", "Lanipao", "Luinab", "Mahayahay", "Mainit", "Mandulog", "Maria Cristina", "Pala-o",
    "Panoroganan", "Poblacion", "Puga-an", "Rogongon", "San Miguel", "San Roque", "Santa Elena",
    "Santa Filomena", "Santiago", "Santo Rosario", "Saray", "Suarez", "Tambacan", "Tibanga",
    "Tipanoy", "Tomas L. Cabili (Tominobo Proper)", "Upper Tominobo", "Tubod", "Ubaldo Laya", "Upper Hinaplanon",
    "Villa Verde"
];

const currentYear = new Date().getFullYear(); 
const years = Array.from({ length: currentYear - 2020 + 1 }, (_, index) => 2020 + index);

const handleBarangayChange = (event) => {
  setSelectedBarangay(event.target.value);
};

const handleYearChange = (event) => {
  setSelectedYear(event.target.value);
};

  //Page ni
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };


  const handleAddDisaster = () => {
    navigate("/dashboard/add-disaster");
  };

  const handleUploadCsvClick = () => {
    setModalType("upload");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
  
    if (file) {
      setIsUploading(true);
  
      // Parse the CSV file
      Papa.parse(file, {
        header: true,
        complete: async (result) => {
          const parsedData = result.data;
          const collectionRef = collection(db, "data"); // Replace with your Firestore collection name
  
          // Map the CSV fields to single-word keys
          const mappedData = parsedData.map(row => ({
            barangays: row["Affected Barangays"],
            contact: row["Camp Manager Contact"],
            disasterCode: row["Disaster Code"],
            disasterDate: row["Disaster Date"],
            disasterType: row["Disaster Type"],
            familiesInEC: row["No. Of Families Inside ECs"],
            affectedFamilies: row["No. of Affected Families"],
            affectedPersons: row["No. of Affected Persons"],
            indigenousPeoples: row["Number of Indigenous Peoples"],
            lactatingMothers: row["Number of Lactating Mothers"],
            pwds: row["Number of PWDs"],
            pregnantWomen: row["Number of Pregnant Women"],
            soloParents: row["Number of Solo Parents"],
            assistanceNeeded: row["Services/Assistance Needed"],
            sexBreakdown: row["Sex Breakdown"],
          }));
  
          // Upload each transformed row to Firestore
          for (const row of mappedData) {
            try {
              console.log("Uploading row:", row); // Log row being uploaded
              await addDoc(collectionRef, row); // Upload row to Firestore
              
              console.log("Disaster Code:", row.disasterCode); // Check the disasterCode value
              if (!row.disasterCode) {
                console.error("Missing disaster code for row:", row); // Log if disasterCode is missing
                return; // Skip the row if disasterCode is missing
              }
            } catch (error) {
              console.error("Error uploading row:", row, error); // Log the row that failed
            }
          }
            
          setIsUploading(false);
          setIsModalOpen(false);
          alert("File upload process completed!");
        },
        error: (error) => {
          console.error("Error parsing CSV file:", error);
          setIsUploading(false);
          alert("Error parsing CSV file: " + error.message);
        },
      });
    }
  };
  

    useEffect(() => {
      const fetchDisasters = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "data"));
          const disastersData = querySnapshot.docs.map(doc => doc.data());
          const sortedDisasters = disastersData.sort((a, b) => {
            const dateA = new Date(a.disasterDate); // Convert to Date object
            const dateB = new Date(b.disasterDate);
            return dateA - dateB; // Sort in ascending order
          });
    
          setDisasters(sortedDisasters); 
        } catch (error) {
          console.error("Error fetching disasters data:", error);
        }
      };
  
      fetchDisasters();  // Call the function to fetch data
    }, []);

  //new
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query); 
    console.log("Search Query: ", query); // Debugging the query
  };
  
  const filteredDisasters = disasters.filter((disaster) => {
    const excludeColumns = [
      "affectedFamilies", "affectedPersons", "familiesInEC", "sexBreakdown",
      "pregnantWomen", "lactatingMothers", "pwds", "soloParents", "indigenousPeoples", "assistanceNeeded"
    ];
  
    return Object.keys(disaster).some((key) => {
      if (!excludeColumns.includes(key)) {
        const value = disaster[key];
        if (value && value.toString) {
          return value.toString().toLowerCase().includes(searchQuery); 
        }
      }
      return false;
    });
  });  

  const displayDisasters = filteredDisasters.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  return (
    <div className="dashboard">

      <div className="dash-btn">

        <button className="add-disaster" onClick={handleAddDisaster}>
          <i className="fa-solid fa-file-circle-plus"></i>
          Add Disaster
        </button>

        <button className="upload-csv" onClick={handleUploadCsvClick}>
          <i className="fa-solid fa-upload"></i>
          Upload CSV
        </button>

      </div>
    
      <div className="dashboard-container">

      {/*dropdown for barangays*/}
      <label htmlFor="barangay">Select Barangay: </label>
      <select id="barangay" name="barangay" value={selectedBarangay} onChange={handleBarangayChange}>
      <option value="All">All</option>
        {barangays.map((barangay, index) => (
          <option key={index} value={barangay}>
            {barangay}
          </option>
        ))}
      </select>
      {/*dropdown for years*/}
      <label htmlFor="year">Select Year: </label>
      <select id="year" name="year" value={selectedYear} onChange={handleYearChange}>
      <option value="All">All</option>
        {years.map((year, index) => (
          <option key={index} value={year}>
            {year}
          </option>
        ))}
      </select>
        
        <div className="ch1">
        <Barc barangay={selectedBarangay} year={selectedYear} />
        </div>
        <div className="ch2">
        <Map barangay={selectedBarangay} year={selectedYear} />
        <Piec barangay={selectedBarangay} year={selectedYear} />
        </div>

        <div className="residents-table">
        <div className="search"> 
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search..." onChange={handleSearchChange} className="search-bar"/>
        </div>
          <table>
              <thead>
                <tr>
                  <th>Disaster Code</th>
                  <th>Disaster Type</th>
                  <th>Disaster Date</th>
                  <th>Affected Barangays</th>
                  <th>No. of Affected Families</th>
                  <th>No. of Affected People</th>
                  <th>Families in EC</th>
                  <th>Sex Breakdown</th>
                  <th>No. of Pregnant Women</th>
                  <th>No. of Lactating Mothers</th>
                  <th>No. of PWDs</th>
                  <th>No. of Solo Parents</th>
                  <th>No. of Indigenous People</th>
                  <th>Services/Assistance Needed</th>
                  <th>Camp Manager Contact No.</th>
                 
                </tr>
              </thead>
              <tbody>
                {displayDisasters.length > 0 ? (
                  displayDisasters.map((disaster, index) => (
                    <tr key={index}>
                      <td>{disaster.disasterCode}</td>
                      <td>{disaster.disasterType}</td>
                      <td>{disaster.disasterDate}</td>
                      <td>{disaster.barangays}</td>
                      <td>{disaster.affectedFamilies}</td>
                      <td>{disaster.affectedPersons}</td>
                      <td>{disaster.familiesInEC}</td>
                      <td>{disaster.sexBreakdown}</td>
                      <td>{disaster.pregnantWomen}</td>
                      <td>{disaster.lactatingMothers}</td>
                      <td>{disaster.pwds}</td>
                      <td>{disaster.soloParents}</td>
                      <td>{disaster.indigenousPeoples}</td>
                      <td>{disaster.assistanceNeeded}</td>
                      <td>{disaster.contact}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No disasters found.</td>
                  </tr>
                )}                     
              </tbody>
            </table>
         
        </div>

        <div class="res-button-container">
          <button 
            class="nav-button prev" 
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
              <i className="fa-solid fa-angle-left"></i>
          </button>

          <button 
            class="nav-button next" 
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
              <i className="fa-solid fa-angle-right"></i>
          </button>
        </div>
           
      </div>

      {isModalOpen && modalType === "upload" && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              ×
            </button>
            <h2 className="modal-title">Upload Disaster CSV</h2>
            <form onSubmit={handleFileUpload} className="upload-form">
              <input type="file" accept=".csv" onChange={handleFileChange} />
              <button type="submit" className="submit-btn" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default Dashboard;

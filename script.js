document.addEventListener("DOMContentLoaded", () => {

    const companyGrid = document.getElementById("companyGrid");
    const jobGrid = document.getElementById("jobGrid");
    const searchInput = document.getElementById("search");

    let jobs = [];

    async function loadJobs(){

        try{

            const response = await fetch("jobs.json");

            jobs = await response.json();

            renderCompanies(jobs);

            renderJobs(jobs);

        }

        catch(err){

            console.error(err);

        }

    }

    function renderCompanies(data){

        companyGrid.innerHTML = "";

        data.forEach(job=>{

            companyGrid.innerHTML += `

            <div class="company-card">

                <h3>${job.company}</h3>

                <p><strong>Role:</strong> ${job.role}</p>

                <p><strong>Location:</strong> ${job.location}</p>

                <p><strong>Batch:</strong> ${job.batch}</p>

                <a href="${job.link}" target="_blank">

                    ${job.status==="Coming Soon" ? "Coming Soon" : "Apply Now"}

                </a>

            </div>

            `;

        });

    }

    function renderJobs(data){

        jobGrid.innerHTML="";

        data.forEach(job=>{

            const skills = job.skills.map(skill=>`<li>${skill}</li>`).join("");

            jobGrid.innerHTML += `

            <div class="job-card">

                <span class="badge">${job.status}</span>

                <h3>${job.company} - ${job.role}</h3>

                <p>${job.batch} Graduates</p>

                <ul>

                    ${skills}

                </ul>

                <a href="${job.link}" target="_blank">

                    View Job

                </a>

            </div>

            `;

        });

    }

    searchInput.addEventListener("keyup",()=>{

        const value = searchInput.value.toLowerCase();

        const filtered = jobs.filter(job=>{

            return (

                job.company.toLowerCase().includes(value)

                ||

                job.role.toLowerCase().includes(value)

                ||

                job.location.toLowerCase().includes(value)

                ||

                job.batch.toLowerCase().includes(value)

                ||

                job.skills.join(" ").toLowerCase().includes(value)

            );

        });

        renderCompanies(filtered);

        renderJobs(filtered);

    });

    loadJobs();

});

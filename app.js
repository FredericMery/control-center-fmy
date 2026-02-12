const supabaseUrl = 'https://fwfvbklrezgiwpfyywtv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3ZnZia2xyZXpnaXdwZnl5d3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MzkwNDIsImV4cCI6MjA4NjQxNTA0Mn0.g58rXlwhfqvp5AiYZUOTlS-n2g-wG2Jufdyyu6ncSrg'
const db = window.supabase.createClient(supabaseUrl, supabaseKey)


let currentMode = "pro"

const proBtn = document.getElementById("proBtn")
const persoBtn = document.getElementById("persoBtn")

proBtn.onclick = () => {
  currentMode = "pro"
  proBtn.classList.add("active")
  persoBtn.classList.remove("active")
  fetchTasks()
}

persoBtn.onclick = () => {
  currentMode = "perso"
  persoBtn.classList.add("active")
  proBtn.classList.remove("active")
  fetchTasks()
}







let showArchived = false
let tasks = []

const modal = document.getElementById("modal")
const fab = document.getElementById("fab")
const toggleView = document.getElementById("toggleView")

fab.onclick = () => modal.classList.remove("hidden")
modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden") }

toggleView.onclick = () => {
  showArchived = !showArchived
  toggleView.textContent = showArchived ? "Actives" : "Archives"
  fetchTasks()
}

async function fetchTasks(){
  const {data}=await db
    .from('tasks')
    .select('*')
    .eq('archived',showArchived)
    .eq('type',currentMode)
    .order('created_at',{ascending:false})

  tasks=data||[]
  renderTasks()
}


async function archiveTask(id){
  await db.from('tasks').update({ archived:true }).eq('id', id)
}

function formatDate(dateString){
  if(!dateString) return ""

  const today = new Date()
  const date = new Date(dateString)

  today.setHours(0,0,0,0)
  date.setHours(0,0,0,0)

  const diffDays = Math.round((date - today)/(1000*60*60*24))

  if(diffDays === 0) return "⏰ Aujourd’hui"
  if(diffDays === 1) return "⏰ Demain"
  if(diffDays < 0) return "⚠️ En retard"

  return date.toLocaleDateString('fr-FR',{
    day:'2-digit',
    month:'2-digit',
    year:'numeric'
  })
}

function renderTasks(){
  const list = document.getElementById("actionsList")
  list.innerHTML = ""

  tasks.forEach(task=>{

    const deadlineText = formatDate(task.deadline)

    let deadlineClass = "deadline"
    let cardClass = "action-card"

    if(deadlineText.includes("En retard")){
      deadlineClass += " deadline-late"
      cardClass += " card-late"
    }
    else if(deadlineText.includes("Aujourd") || deadlineText.includes("Demain")){
      deadlineClass += " deadline-soon"
      cardClass += " card-soon"
    }

    const div = document.createElement("div")
    div.className = cardClass

    div.innerHTML = `
      <div class="action-left">
        <span class="badge ${task.priority || 'normal'}"></span>
        ${task.title}
      </div>
      <div class="${deadlineClass}">
        ${deadlineText}
      </div>
    `

    div.ondblclick = () => archiveTask(task.id)
    list.appendChild(div)
  })
}

document.getElementById("saveBtn").onclick = async () => {
  const text = document.getElementById("actionText").value
  const deadline = document.getElementById("deadline").value
  const priority = document.getElementById("priority").value

  if(!text) return

  await db.from('tasks').insert([
  {
    title:text,
    deadline,
    priority,
    type: currentMode
  }
])





  document.getElementById("actionText").value=""
  modal.classList.add("hidden")
}

window.onload = () => {
  fetchTasks()

  db.channel('tasks-realtime')
    .on('postgres_changes',
      { event:'*', schema:'public', table:'tasks' },
      ()=>fetchTasks()
    )
    .subscribe()
}

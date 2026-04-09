(function () {
  const STORAGE_KEY = 'aiAgencyDemoData';

  const defaultData = {
    metrics: {
      hoursSaved: 142,
      autoBookings: 284,
      extraRevenue: 8.4,
      aiChatsHandled: 1029
    },
    log: [
      { trigger: 'Website Chat', customer: 'Sarah Jenkins', action: 'Booked appointment', status: 'Completed', time: '2 mins ago' },
      { trigger: 'Missed Call', customer: '+1 (555) 019-2834', action: 'Sent SMS follow-up', status: 'Completed', time: '15 mins ago' },
      { trigger: 'New Lead Form', customer: 'Mike Ross', action: 'Added to CRM & emailed', status: 'Completed', time: '1 hour ago' },
      { trigger: 'Review Request', customer: 'Jane Doe', action: 'Sent email drip', status: 'Processing', time: '2 hours ago' }
    ],
    leads: []
  };

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : structuredClone(defaultData);
    } catch (error) {
      return structuredClone(defaultData);
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function resetData() {
    saveData(structuredClone(defaultData));
    window.location.reload();
  }

  function updateMetricText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = value;
  }

  function renderDashboard(data) {
    updateMetricText('hoursSaved', `${data.metrics.hoursSaved}<span class="unit">h</span>`);
    updateMetricText('autoBookings', `${data.metrics.autoBookings}`);
    updateMetricText('extraRevenue', `$${data.metrics.extraRevenue.toFixed(1)}<span class="unit">k</span>`);
    updateMetricText('aiChatsHandled', `${data.metrics.aiChatsHandled.toLocaleString()}`);

    const body = document.getElementById('automationLogBody');
    if (body) {
      body.innerHTML = data.log.map(item => `
        <tr>
          <td>${item.trigger}</td>
          <td>${item.customer}</td>
          <td>${item.action}</td>
          <td><span class="status ${item.status === 'Completed' ? 'success' : 'pending'}">${item.status}</span></td>
          <td>${item.time}</td>
        </tr>
      `).join('');
    }

    if (window.Chart) {
      renderCharts();
    }
  }

  function renderCharts() {
    const mainChartEl = document.getElementById('mainChart');
    const donutChartEl = document.getElementById('donutChart');
    const legendEl = document.getElementById('donutLegend');

    if (mainChartEl) {
      new Chart(mainChartEl, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Automations',
              data: [12, 18, 16, 24, 22, 28, 31],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.15)',
              tension: 0.35,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }

    if (donutChartEl) {
      new Chart(donutChartEl, {
        type: 'doughnut',
        data: {
          labels: ['Missed Calls', 'Bookings', 'CRM Updates', 'Review Requests'],
          datasets: [{
            data: [35, 28, 22, 15],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
            borderWidth: 0
          }]
        },
        options: {
          cutout: '72%',
          plugins: { legend: { display: false } },
          responsive: true,
          maintainAspectRatio: false
        }
      });

      if (legendEl) {
        const items = [
          ['Missed Calls', '35%', '#3b82f6'],
          ['Bookings', '28%', '#8b5cf6'],
          ['CRM Updates', '22%', '#10b981'],
          ['Review Requests', '15%', '#f59e0b']
        ];
        legendEl.innerHTML = items.map(([label, val, color]) => `
          <div class="legend-item">
            <div class="legend-label-wrap"><span class="dot" style="background:${color}"></span>${label}</div>
            <div class="legend-val">${val}</div>
          </div>
        `).join('');
      }
    }
  }

  function renderLeads(data) {
    const body = document.getElementById('crmLeadsBody');
    if (!body) return;

    if (!data.leads.length) {
      body.innerHTML = '<tr><td colspan="5">No demo leads yet. Run the automation to create one.</td></tr>';
      return;
    }

    body.innerHTML = data.leads.map(lead => `
      <tr>
        <td>${lead.name}</td>
        <td>${lead.phone}</td>
        <td>${lead.business}</td>
        <td>${lead.trigger}</td>
        <td><span class="status success">Saved</span></td>
      </tr>
    `).join('');
  }

  function renderOutput(message) {
    const output = document.getElementById('demoOutput');
    if (!output) return;
    output.innerHTML = message;
  }

  function pulseSteps() {
    const steps = document.querySelectorAll('.step-item');
    if (!steps.length) return;
    steps.forEach((step, index) => {
      step.classList.remove('active-step', 'completed-step');
      setTimeout(() => step.classList.add('active-step'), index * 350);
      setTimeout(() => {
        step.classList.remove('active-step');
        step.classList.add('completed-step');
      }, index * 350 + 250);
    });
  }

  function bindForm(data) {
    const form = document.getElementById('automationForm');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = document.getElementById('customerName').value.trim();
      const phone = document.getElementById('customerPhone').value.trim();
      const business = document.getElementById('businessType').value;
      const trigger = document.getElementById('triggerType').value;

      const lead = { name, phone, business, trigger };
      data.leads.unshift(lead);
      data.log.unshift({
        trigger,
        customer: name,
        action: 'SMS sent + lead added to CRM',
        status: 'Completed',
        time: 'Just now'
      });
      data.log = data.log.slice(0, 8);

      data.metrics.hoursSaved += 1;
      data.metrics.autoBookings += 1;
      data.metrics.extraRevenue = Number((data.metrics.extraRevenue + 0.1).toFixed(1));
      data.metrics.aiChatsHandled += 3;

      saveData(data);
      renderLeads(data);
      pulseSteps();
      renderOutput(`
        <h3>Automation complete</h3>
        <p><strong>${name}</strong> triggered a <strong>${trigger}</strong> flow for a <strong>${business}</strong>.</p>
        <ul>
          <li>Instant SMS follow-up prepared</li>
          <li>Lead saved to CRM</li>
          <li>Team notified for next-step booking</li>
        </ul>
      `);
      form.reset();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const data = loadData();
    renderDashboard(data);
    renderLeads(data);
    bindForm(data);

    const resetBtn = document.getElementById('resetDemoBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetData);
    }
  });
})();

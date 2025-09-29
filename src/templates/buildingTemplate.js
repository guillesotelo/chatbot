const htmlBuildingTemplate = `
<div style="display: flex; justify-content: center; align-items: center; background-color: #202020; border-radius: 4rem;">
    <div style="border-radius: 8px; text-align:center">
        <p style="font-family: Arial, sans-serif; font-weight: bold; color: #a5a5a5;">Building Veronica<span id="ellipsis">.</span></p>
        <p style="font-family: Arial, sans-serif; display: none;  font-size: 1rem; color: #a5a5a5;">The chat will be reloaded in <span id="countdown">30</span> seconds. Please wait.</p>
    </div>
</div>
<script>
    let countdownValue = 30;
    let ellipsis = '.'
    const body = document.querySelector('body')
    if(body) body.style.backgroundColor = '#202020'
    function updateCountdown() {
        countdownValue--;
        document.getElementById('countdown').innerText = countdownValue;
        if (countdownValue <= 0) window.location.reload();
        else  setTimeout(updateCountdown, 1000);
        
        ellipsis = ellipsis.length === 3 ? '.' : ellipsis + '.';
        document.getElementById('ellipsis').innerText = ellipsis;
    }
    updateCountdown();
</script>
`

module.exports = { htmlBuildingTemplate }

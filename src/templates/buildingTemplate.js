const htmlBuildingTemplate = `
<div style="display: flex; justify-content: center; align-items: center; height: 90vh; background-color: #202020;">
    <div style="background-color: #151515; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 50px 1px black; text-align:center">
        <h2 style="font-family: Arial, sans-serif; font-size: 1.5rem; font-weight: bold; color: #a5a5a5;">Updating Assistant<span id="ellipsis">.</span></h2>
        <p style="font-family: Arial, sans-serif; font-size: 1rem; color: #a5a5a5;">The chat will be reloaded in <span id="countdown">30</span> seconds. Please wait.</p>
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

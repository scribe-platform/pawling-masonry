// Estimate form. The site isn't live yet, so nothing is sent anywhere.
(function () {
  var form = document.getElementById('estimate-form');
  var status = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var contact = form.contact.value.trim();

    if (!name || !contact) {
      status.textContent = 'Add your name and a phone number or email so Mark can reach you.';
      status.className = 'form-status err';
      return;
    }

    status.textContent = 'Thanks, ' + name.split(' ')[0] + '. This is a preview site, so nothing was sent. On the real site, this goes straight to Mark. For now, call or text (717) 286-3170.';
    status.className = 'form-status ok';
    form.reset();
  });
})();

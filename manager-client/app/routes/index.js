import Repo from 'manager-client/models/repo';
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return Repo.findAll();
  },

  setupController(controller, model) {
    const self = this;
    const applicationController = self.controllerFor('application');

    controller.setProperties({ model: model, upgrading: null });

    if(!(window.Discourse && window.Discourse.hasLatestPngcrush)){
      applicationController.appendBannerHtml("<b>WARNING:</b> You are running an old Docker image, <a href='https://meta.discourse.org/t/how-do-i-update-my-docker-image-to-latest/23325'>please upgrade</a>.");
    }

    model.forEach(function(repo) {
      repo.findLatest();
      if (repo.get('upgrading')) {
        controller.set('upgrading', repo);
      }

      // Special case: Upgrade docker manager first
      if (repo.get('id') === 'docker_manager') {
        controller.set('managerRepo', repo);
      }

      // Special case: If the branch is "master" warn user
      if (repo.get('id') === 'discourse' && repo.get('branch') === 'origin/master') {
        applicationController.appendBannerHtml("<b>WARNING:</b> Your Discourse is tracking the 'master' branch which may be unstable, <a href='https://meta.discourse.org/t/change-tracking-branch-for-your-discourse-instance/17014'>we recommend tracking the 'tests-passed' branch</a>.");
      }

    });
  },

  actions: {
    upgrade(repo) {
      this.transitionTo('upgrade', repo);
    }
  }
});

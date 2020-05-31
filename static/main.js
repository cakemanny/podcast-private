/* global Vue */
"use strict";

Vue.component("subscription-list", {
  props: {
    subscriptions: Array
  },
  data: function() {
    return {};
  },
  template: `
    <div class="subscription-list">
      <div
        v-for="subscription in subscriptions" v-bind:key="subscription.url"
        class="subscription-list__item"
        v-on:click="$emit('select-podcast', subscription.url)"
      >
        <img
          class="subscription-list__item-icon"
          v-bind:src="subscription.imageUrl"
          alt="icon"/>
        <span
          v-if="subscription.updated"
          class="subscription-list__item-updated-mark"
        >
          <svg width="3em" height="3em">
            <circle cx="6" cy="6" r="5" stroke="white" stroke-width="1" fill="blue"/>
          </svg>
        </span>
        <h3
          class="subscription-list__item-title"
          >{{subscription.title}}</h3>
      </div>
    </div>
  `
});

Vue.component("podcast-detail", {
  props: {
    subscriptionUrl: String,
    title: String,
    imageUrl: String,
    authors: String,
    link: String,
    description: String,
    episodes: Array
  },
  data: function() {
    return {};
  },
  template: `
    <div class="podcast-detail">
      <nav-row
        title="Podcast"
        v-on:nav-back="$emit('nav-back')"
        />
      <div class="podcast-detail__content">
        <div class="podcast-detail__title-block">
          <div class="podcast-detail__title-and-authors">
            <h3 class="podcast-detail__title">{{title}}</h3>
            <div class="podcast-detail__authors">{{authors}}</div>
          </div>
          <img
            class="podcast-detail__icon"
            v-bind:src="imageUrl"
            alt="icon"/>
        </div>
        <a v-bind:href="link" alt="website">🌎</a>
        <div class="podcast-detail__description">
          <!-- TODO: sanitise and turn into html -->
          {{description}}
        </div>
        <div>
          <h4>Episodes</h4>
          <episode-overview
            v-for="episode in episodes" v-bind:key="episode.guid"
            v-bind:date="episode.pubDate"
            v-bind:title="episode.title"
            v-bind:location="episode.location"
            v-bind:completed="episode.completed"
            v-on:select-episode="$emit('select-episode', subscriptionUrl, episode.guid)"
            v-on:play-episode="$emit('play-episode', subscriptionUrl, episode.guid)"
          />
        </div>
      </div>
    </div>
  `
});

Vue.component("episode-overview", {
  props: {
    date: String,
    title: String,
    location: Number,
    completed: Boolean
  },
  data: function() {
    return {};
  },
  template: `
    <div class="episode-overview">
      <div class="episode-overview__date">{{date}}</div>
      <h5
        class="episode-overview__title"
        v-on:click="$emit('select-episode')"
        >{{title}}</h5>
      <button
        type="button"
        v-on:click="$emit('play-episode')"
        >Play</button>
      <span v-if="completed">Completed</span>
      <span v-else>current location: {{location}}</span>
    </div>
  `
});

Vue.component("episode-detail", {
  props: {},
  data: function() {
    return {};
  },
  template: `
    <div class="episode-detail">
      * Date
      * Podcast Name
      * Episode Title
      * Play button
      * Progress / playcount indicators
      * Episode description
    </div>
  `
});

Vue.component("subscription-add", {
  props: {},
  data: function() {
    return {
      feedUrl: ""
    };
  },
  template: `
    <div class="subscription-add">
      <nav-row
        title="Add Subscription"
        v-on:nav-back="$emit('nav-back')"
        />
      <div class="subscription-add__content">
        <form v-on:submit.prevent="$emit('add-sub', feedUrl)">
          <label class="subscription-add__label">
            RSS feed: <br/>
            <input
              class="subscription-add__input"
              type="text"
              v-model="feedUrl"/>
          </label>
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  `
});

Vue.component("player-strip", {
  props: {
    subscriptionIconUrl: String,
    title: String,
    audioUrl: String
  },
  data: function() {
    return {
      isPlaying: false,
      progressPercentage: 0
    };
  },
  // watch
  //  - if we watch the url, we could auto load
  methods: {
    play() {
      const audio = this.$refs.audio;

      if (!audio.currentSrc || audio.currentSrc != this.audioUrl) {
        audio.oncanplaythrough = () => {
          audio.play();
        };
        audio.load();
      } else {
        audio.play();
      }
    },
    pause() {
      /* probably want to emit a location as progress */
      this.$refs.audio.pause();
    },
    handleTimeUpdate() {
      const audio = this.$refs.audio;
      this.progressPercentage = (100 * audio.currentTime) / audio.duration;
    },
    handleEnded() {
      // TODO: mark episode as completed
      console.log("ended");
      this.isPlaying = false;
    },
    onPlay() {
      this.isPlaying = true;
    },
    onPause() {
      this.isPlaying = false;
    }
  },
  template: `
    <div class="player-strip">
      <audio
        ref="audio"
        v-on:timeupdate="handleTimeUpdate"
        v-on:ended="handleEnded"
        v-on:play="onPlay"
        v-on:pause="onPause"
      >
        <source v-bind:src="audioUrl"/>
      </audio>
      <div class="player-strip__info-row">
        <img
          class="player-strip__icon"
          v-bind:src="subscriptionIconUrl"/>
        <span class="player-strip__title">{{title}}</span>
        <button
          v-if="isPlaying"
          class="player-strip__play-pause"
          alt="pause"
          v-on:click="pause"
          >II</button>
        <button
          v-else
          class="player-strip__play-pause"
          alt="play"
          v-on:click="play"
          v-bind:disabled="!audioUrl"
          >ᐅ</button>
      </div>
      <div class="player-strip__progress-bar">
        <div
          class="player-strip__progress-bar-done"
          v-bind:style="{width: progressPercentage+'%'}"
        ></div>
      </div>
      <div v-if="false">
        expandable detailed player
        independent view
      </div>
    </div>
  `
});

Vue.component("nav-row", {
  props: {
    title: String
  },
  template: `
    <div class="nav-row">
      <button
        class="nav-row__back-button"
        v-on:click="$emit('nav-back')"
        >‹</button>
      <span style="color:grey">{{title}}</span>
      <span class="nav-row__spacer">⋮</span>
    </div>
  `
});

window.app = new Vue({
  el: "#app",
  data: {
    /* view state */
    view: "home",
    selectedSubscription: "",
    selectedEpisode: "",

    /* player state? */
    playingSubscription: "",
    playingEpisode: "",

    /* more permanent data */
    subscriptions: [],

    /* indexed data */
    fetchedData: {}
  },
  created: function() {
    const saved_subs_json = localStorage.podcast_private__subscriptions;
    if (saved_subs_json) {
      const saved_subs = JSON.parse(saved_subs_json);
      // update subs from the localStorage
      this.subscriptions = saved_subs;
      saved_subs.forEach(sub => {
        fetch("api/fetch_feed?url=" + encodeURIComponent(sub.url))
          .then(r => r.json())
          .then(
            parsedData => {
              this.fetchedData = Object.assign({}, this.fetchedData, {
                [sub.url]: parsedData
              });
              // TODO: updated previousPubDate
            },
            err => {
              console.error(err);
            }
          );
      });
    }
  },
  computed: {
    isPodcastSelected() {
      return this.view === "subscription" && this.selectedSubscription;
    },
    isEpisodeSelected() {
      return (
        this.view === "episode" &&
        this.selectedSubscription &&
        this.selectedEpisode
      );
    },
    isAddSubscription() {
      return this.view === "add_subscription";
    },

    subscriptionList() {
      return this.subscriptions.map(s => {
        const fetchedSub = this.fetchedData[s.url];
        console.log(fetchedSub);
        const imageUrl =
          fetchedSub && fetchedSub.image ? fetchedSub.image.url : undefined;
        const updated =
          fetchedSub && fetchedSub.pubDate
            ? fetchedSub.pubDate !== s.previousPubDate
            : false;
        return {
          title: s.title,
          url: s.url,
          imageUrl,
          updated
        };
      });
    },

    selectedPodcast() {
      if (!this.selectedSubscription) {
        return undefined;
      }

      for (let subscription of this.subscriptions) {
        if (subscription.url === this.selectedSubscription) {
          const fetched = this.fetchedData[subscription.url];
          const episodes = fetched.items.map(item => {
            const progress = subscription.episodeProgress[item.guid] || {
              location: 0,
              completed: false
            };
            return Object.assign({}, item, progress);
          });
          return {
            subscriptionUrl: subscription.url,
            title: subscription.title,
            imageUrl: fetched.image.url,
            authors: "",
            link: fetched.link,
            description: subscription.description,
            episodes
          };
        }
      }
    },

    playingEpisodeData() {
      const ifNotFound = {};
      if (this.playingSubscription && this.playingEpisode) {
        const fetched = this.fetchedData[this.playingSubscription];
        if (!fetched) {
          return ifNotFound;
        }

        for (let item of fetched.items) {
          if (item.guid === this.playingEpisode) {
            return {
              iconUrl: fetched.image.url,
              title: item.title,
              audioUrl: item.enclosure.url
            };
          }
        }
      }
      return ifNotFound;
    }
  },
  methods: {
    goHome() {
      this.view = "home";
      this.selectedSubscription = "";
      this.selectedEpisode = "";
    },
    goAddFeed() {
      this.view = "add_subscription";
      this.selectedSubscription = "";
      this.selectedEpisode = "";
    },

    selectPodcast(rssUrl) {
      this.selectedSubscription = rssUrl;
      this.view = "subscription";
    },

    playEpisode(subscriptionUrl, episodeGuid) {
      this.playingSubscription = subscriptionUrl;
      this.playingEpisode = episodeGuid;
    },

    addFeed(rssUrl) {
      fetch("api/fetch_feed?url=" + encodeURIComponent(rssUrl))
        .then(r => r.json())
        .then(
          parsedData => {
            if (this.subscriptions.map(s => s.url).includes(rssUrl)) {
              console.log("removing existing");
              this.subscriptions = this.subscriptions.filter(
                s => s.url !== rssUrl
              );
            }
            this.subscriptions.push({
              url: rssUrl,
              title: parsedData.title,
              description: parsedData.description,
              previousPubDate: parsedData.previousPubDate,
              episodeProgress: {}
            });
            localStorage.podcast_private__subscriptions = JSON.stringify(
              this.subscriptions
            );

            this.fetchedData = Object.assign({}, this.fetchedData, {
              [rssUrl]: parsedData
            });
            this.goHome();
          },
          err => {
            console.error(err);
            this.goHome();
          }
        );
    }
  }
});

/* global Vue */
"use strict";

/**
 * just out of good practise, avoid loading any URLs what aren't https
 */
function httpsOrUndefined(givenUrl) {
  if (givenUrl && givenUrl.startsWith("https://")) {
    return givenUrl;
  }
  if (givenUrl && givenUrl.startsWith("http://")) {
    // could be worth a shot...
    return givenUrl.replace("http://", "https://");
  }
  return undefined;
}

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
  computed: {
    formattedLocation() {
      const minutes = Math.floor(this.location / 60);
      const seconds = Math.floor(this.location % 60);
      if (seconds < 10) {
        return `${minutes}:0${seconds}`;
      }
      return `${minutes}:${seconds}`;
    }
  },
  template: `
    <div class="episode-overview">
      <div class="episode-overview__date">{{date}}</div>
      <h5
        class="episode-overview__title"
        v-on:click="$emit('select-episode')"
        >{{title}}</h5>
      <button
        class="episode-overview__play-button"
        type="button"
        v-on:click="$emit('play-episode')"
        >Play</button>
      <span v-if="completed">Completed</span>
      <span v-else>current location: {{formattedLocation}}</span>
    </div>
  `
});

Vue.component("episode-detail", {
  props: {
    title: String,
    date: String,
    location: Number,
    completed: Boolean,
    description: String,
    podcastTitle: String,
    podcastIconUrl: String
  },
  data: function() {
    return {};
  },
  computed: {
    formattedLocation() {
      const minutes = Math.floor(this.location / 60);
      const seconds = Math.floor(this.location % 60);
      if (seconds < 10) {
        return `${minutes}:0${seconds}`;
      }
      return `${minutes}:${seconds}`;
    },

    sanitisedDescription() {
      const allowedTags = [
        "A",
        "B",
        "BR",
        "DIV",
        // "IMG",
        "LI",
        "OL",
        "P",
        "SPAN",
        "STRONG",
        "U",
        "UL"
      ];

      let elem = document.createElement("div");
      elem.innerHTML = this.description;

      if (elem.firstElementChild === null) {
        return this.description;
      }

      let walk = function walk(e, parent) {
        while (e) {
          if (e.firstChild) {
            walk(e.firstChild, e);
          }
          // Remove all disallowed nodes
          if (e.nodeType === 1 && !allowedTags.includes(e.nodeName)) {
            let toRemove = e;
            e = e.nextSibling;
            parent.removeChild(toRemove);
            continue;
          }
          if (e.nodeType === 1) {
            e.removeAttribute("class");
            e.removeAttribute("style");
          }
          e = e.nextSibling;
        }
      };
      walk(elem.firstChild, elem);

      return elem.innerHTML;
    }
  },
  template: `
    <div class="episode-detail">
      <nav-row
        title="Episode"
        v-on:nav-back="$emit('nav-back')"
        />
      <div class="episode-detail__content">
        <div class="episode-detail__podcast-title-holder">
          <img
            class="episode-detail__podcast-icon"
            alt="icon"
            v-bind:src="podcastIconUrl"/>
          <h4 class="episode-detail__podcast-title"
            >{{podcastTitle}}</h4>
        </div>
        <h3 class="episode-detail__title">
          {{title}}
        </h3>
        <div class="episode-detail__date">{{date}}</div>
        <div class="episode-detail__progress">
          <button
            class="episode-detail__play-button"
            type="button"
            v-on:click="$emit('play-episode')"
            >Play</button>
          current location: {{formattedLocation}}
        </div>
        <div class="episode-detail__description">
          <span v-html="sanitisedDescription"></span>
        </div>
      </div>
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
  watch: {
    audioUrl: function() {
      this.play();
    }
  },
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
    handleDurationChange(e) {
      // TODO
      console.log(e);
    },
    handleTimeUpdate() {
      const audio = this.$refs.audio;
      this.progressPercentage = (100 * audio.currentTime) / audio.duration;
    },
    handleEnded() {
      this.isPlaying = false;
      this.$emit("episode-complete");
    },
    onPlay() {
      this.isPlaying = true;
    },
    onPause() {
      this.isPlaying = false;
      this.$emit("position-update", this.$refs.audio.currentTime);
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
        v-on:durationchange="handleDurationChange"
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
    selectedSubscriptionUrl: "",
    selectedEpisodeGuid: "",

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
              // TODO: updated lastBuildDate
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
      return this.view === "subscription" && this.selectedSubscriptionUrl;
    },
    isEpisodeSelected() {
      return (
        this.view === "episode" &&
        this.selectedSubscriptionUrl &&
        this.selectedEpisodeGuid
      );
    },
    isAddSubscription() {
      return this.view === "add_subscription";
    },

    subscriptionList() {
      return this.subscriptions.map(s => {
        const fetchedSub = this.fetchedData[s.url];
        if (!fetchedSub) {
          return {
            title: s.title,
            url: s.url,
            error: true
          };
        }
        console.log(fetchedSub);
        // might be better just to display the last build date 🤷
        const updated = fetchedSub.lastBuildDate
          ? fetchedSub.lastBuildDate !== s.lastBuildDate
          : false;
        const imageUrl =
          fetchedSub.image && httpsOrUndefined(fetchedSub.image.url);
        return {
          title: s.title,
          url: s.url,
          imageUrl,
          updated
        };
      });
    },

    selectedPodcast() {
      if (!this.selectedSubscriptionUrl) {
        return undefined;
      }

      for (let subscription of this.subscriptions) {
        if (subscription.url === this.selectedSubscriptionUrl) {
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
            imageUrl: fetched.image && httpsOrUndefined(fetched.image.url),
            authors: "",
            link: fetched.link,
            description: subscription.description,
            episodes
          };
        }
      }
    },

    selectedEpisode() {
      if (!this.selectedSubscriptionUrl || !this.selectedEpisodeGuid) {
        return undefined;
      }

      const subscription = this.subscriptions.filter(
        s => s.url == this.selectedSubscriptionUrl
      )[0];
      if (!subscription) {
        return undefined;
      }

      const fetched = this.fetchedData[subscription.url];
      if (!fetched) {
        return undefined;
      }
      const episode = fetched.items.filter(
        i => i.guid == this.selectedEpisodeGuid
      )[0];
      if (!episode) {
        return undefined;
      }

      return Object.assign(
        { location: 0, completed: false },
        episode,
        subscription.episodeProgress[episode.guid],
        {
          podcastTitle: subscription.title,
          podcastIconUrl: fetched.image && httpsOrUndefined(fetched.image.url)
        }
      );
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
              iconUrl: httpsOrUndefined(fetched.image.url),
              title: item.title,
              audioUrl: httpsOrUndefined(item.enclosure.url)
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
      this.selectedSubscriptionUrl = "";
      this.selectedEpisodeGuid = "";
    },
    goAddFeed() {
      this.view = "add_subscription";
      this.selectedSubscriptionUrl = "";
      this.selectedEpisodeGuid = "";
    },

    selectPodcast(rssUrl) {
      this.selectedSubscriptionUrl = rssUrl;
      this.selectedEpisodeGuid = "";
      this.view = "subscription";
    },

    selectEpisode(rssUrl, episodeGuid) {
      this.selectedSubscriptionUrl = rssUrl;
      this.selectedEpisodeGuid = episodeGuid;
      this.view = "episode";
    },

    playEpisode(subscriptionUrl, episodeGuid) {
      this.playingSubscription = subscriptionUrl;
      this.playingEpisode = episodeGuid;
    },

    saveToStorage() {
      localStorage.podcast_private__subscriptions = JSON.stringify(
        this.subscriptions
      );
    },

    markEpisodeProgress(timestamp) {
      if (this.playingSubscription && this.playingEpisode) {
        this.subscriptions = this.subscriptions.map(subscription => {
          if (subscription.url !== this.playingSubscription) {
            return subscription;
          }

          const newProgress = Object.assign(
            {
              completed: false
            },
            subscription.episodeProgress[this.playingEpisode],
            {
              location: timestamp
            }
          );

          return Object.assign({}, subscription, {
            episodeProgress: Object.assign({}, subscription.episodeProgress, {
              [this.playingEpisode]: newProgress
            })
          });
        });

        this.saveToStorage();
      }
    },

    markEpisodeCompleted() {
      if (this.playingSubscription && this.playingEpisode) {
        this.subscriptions = this.subscriptions.map(subscription => {
          if (subscription.url !== this.playingSubscription) {
            return subscription;
          }

          return Object.assign({}, subscription, {
            episodeProgress: Object.assign({}, subscription.episodeProgress, {
              [this.playingEpisode]: {
                location: 0,
                completed: true
              }
            })
          });
        });

        this.saveToStorage();
      }
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
              lastBuildDate: parsedData.lastBuildDate,
              episodeProgress: {}
            });
            this.saveToStorage();

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

FROM docker-registry.bellevue.agilysys.com:5000/official/node:16-20220316-2114 AS build
EXPOSE 80

## set work dir
WORKDIR /ui

## install and copy depndencies
COPY ./package.json /ui/
RUN npm install --force
#RUN npm i adjust-sourcemap-loader
#RUN npm audit fix
#RUN npm install moment@2.22.2
#RUN npm install @angular-devkit/build-angular@0.803.24

## copy app
COPY . /ui/

## RUN ls

## build app
RUN npm run appliance-build 
## RUN ls

FROM docker-registry.bellevue.agilysys.com:5000/official/nginxbase:A1.22.1-20230207-0444

## Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY --from=build  /ui/dist/ /usr/share/nginx/html/Retail

CMD ["nginx", "-g", "daemon off;"]